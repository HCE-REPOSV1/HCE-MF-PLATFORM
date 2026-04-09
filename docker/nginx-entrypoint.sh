#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# nginx-entrypoint.sh — Genera config nginx dinámica con soporte SSL opcional
#
# Variables de entorno:
#   PORT        Puerto HTTP  (default: 80)
#   SSL_PORT    Puerto HTTPS (default: 443)
#   USE_SSL     true|false   (default: false)
#   CERT_PATH   Ruta a certs (default: /etc/nginx/certs)
#   NGINX_TYPE  spa|remote   (default: remote)
#               spa    → fallback a index.html (mf-shell)
#               remote → fallback 404 + CORS * (microfronts remotos)
#
# Formatos de certificado soportados (igual que el API Gateway):
#   Prioridad 1: .pfx / .p12  (con password.txt opcional)
#   Prioridad 2: *.key + *.crt / *.cer
# ─────────────────────────────────────────────────────────────────────────────
set -e

PORT="${PORT:-80}"
SSL_PORT="${SSL_PORT:-443}"
USE_SSL="${USE_SSL:-false}"
CERT_PATH="${CERT_PATH:-/etc/nginx/certs}"
NGINX_TYPE="${NGINX_TYPE:-remote}"
NGINX_CONF="/etc/nginx/conf.d/default.conf"

SSL_KEY=""
SSL_CERT=""

# ── Detección y preparación de certificados ───────────────────────────────────
try_find_certs() {
  dir="$1"
  [ -d "$dir" ] || { echo "   ✘ ${dir}  (no existe)"; return 1; }

  key=$(find "$dir" -maxdepth 1 -iname "*.key" 2>/dev/null | head -1)
  cert=$(find "$dir" -maxdepth 1 \( -iname "*.crt" -o -iname "*.cer" \) 2>/dev/null | head -1)

  if [ -n "$key" ] && [ -n "$cert" ]; then
    SSL_KEY="$key"
    SSL_CERT="$cert"
    echo "   ✔ ${dir}  (.key + .crt)"
    return 0
  fi

  pfx=$(find "$dir" -maxdepth 1 \( -iname "*.pfx" -o -iname "*.p12" \) 2>/dev/null | head -1)
  if [ -n "$pfx" ]; then
    pw_file=$(find "$dir" -maxdepth 1 -iname "password.txt" 2>/dev/null | head -1)
    passphrase=""
    if [ -n "$pw_file" ]; then
      passphrase=$(grep -i 'password\|passphrase' "$pw_file" 2>/dev/null \
                   | sed 's/^[^:]*:\s*//' | tr -d '\r\n')
      [ -z "$passphrase" ] && passphrase=$(cat "$pw_file" | tr -d '\r\n')
    fi

    tmp_key="/tmp/ssl_nginx.key"
    tmp_cert="/tmp/ssl_nginx.crt"

    if openssl pkcs12 -in "$pfx" -nocerts -nodes \
         -passin "pass:${passphrase}" -out "$tmp_key" 2>/dev/null && \
       openssl pkcs12 -in "$pfx" -clcerts -nokeys \
         -passin "pass:${passphrase}" -out "$tmp_cert" 2>/dev/null; then
      SSL_KEY="$tmp_key"
      SSL_CERT="$tmp_cert"
      echo "   ✔ ${dir}  (PFX convertido a PEM)"
      return 0
    else
      echo "   ✘ ${dir}  (PFX no se pudo convertir — passphrase incorrecta?)"
      return 1
    fi
  fi

  echo "   ✘ ${dir}  (sin certificados)"
  return 1
}

# ── Generadores de config nginx ───────────────────────────────────────────────

# Bloque location según tipo: spa usa fallback index.html, remote usa =404 + CORS
location_block() {
  if [ "$NGINX_TYPE" = "spa" ]; then
    cat << 'EOF'
    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|svg|ico|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Cross-Origin-Resource-Policy cross-origin;
    }
EOF
  else
    cat << 'EOF'
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, OPTIONS";

    location / {
        try_files $uri $uri/ =404;
    }

    location ~* \.(js|css|png|svg|ico|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin *;
        add_header Cross-Origin-Resource-Policy cross-origin;
    }
EOF
  fi
}

write_http_conf() {
  {
    printf 'server {\n'
    printf '    listen %s;\n' "$PORT"
    printf '    server_name _;\n'
    printf '    root /usr/share/nginx/html;\n'
    printf '    index index.html;\n\n'
    location_block
    printf '}\n'
  } > "$NGINX_CONF"
}

write_ssl_conf() {
  {
    # Servidor HTTP (activo en paralelo, sin redirect — igual que el AG)
    printf 'server {\n'
    printf '    listen %s;\n' "$PORT"
    printf '    server_name _;\n'
    printf '    root /usr/share/nginx/html;\n'
    printf '    index index.html;\n\n'
    location_block
    printf '}\n\n'

    # Servidor HTTPS
    printf 'server {\n'
    printf '    listen %s ssl;\n' "$SSL_PORT"
    printf '    server_name _;\n\n'
    printf '    ssl_certificate     %s;\n' "$SSL_CERT"
    printf '    ssl_certificate_key %s;\n' "$SSL_KEY"
    printf '    ssl_protocols       TLSv1.2 TLSv1.3;\n'
    printf '    ssl_ciphers         HIGH:!aNULL:!MD5;\n\n'
    printf '    root /usr/share/nginx/html;\n'
    printf '    index index.html;\n\n'
    location_block
    printf '}\n'
  } > "$NGINX_CONF"
}

# ── Main ──────────────────────────────────────────────────────────────────────
SSL_ACTIVE=false

if [ "$USE_SSL" = "true" ]; then
  echo "🔍 Buscando certificados SSL en ${CERT_PATH}..."
  if try_find_certs "$CERT_PATH"; then
    SSL_ACTIVE=true
  else
    echo "⚠️  USE_SSL=true pero sin certificados válidos — solo HTTP"
  fi
fi

if [ "$SSL_ACTIVE" = "true" ]; then
  write_ssl_conf
  echo "🔒 HTTPS activo → puerto ${SSL_PORT}"
  echo "🌐 HTTP  activo → puerto ${PORT}"
else
  write_http_conf
  echo "🌐 HTTP activo → puerto ${PORT}"
fi

echo "▶  nginx [${NGINX_TYPE}] arrancando..."
exec nginx -g "daemon off;"
