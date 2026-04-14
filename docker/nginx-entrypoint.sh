#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# nginx-entrypoint.sh — Genera config nginx dinámica con soporte SSL opcional
# Lógica de detección de certificados idéntica al API Gateway (ag-pruebas-ag).
#
# Variables de entorno:
#   PORT        Puerto HTTP  (default: 80)
#   SSL_PORT    Puerto HTTPS (default: 443)
#   USE_SSL     true|false   (default: false)
#   CERT_PATH   Ruta a certs (default: /etc/nginx/certs)
#   NGINX_TYPE  spa|remote   (default: remote)
#
# Formatos de certificado soportados:
#   Prioridad 1: .pfx / .p12  → requiere openssl CLI (opcional)
#                Si no hay openssl o falla → fallback a .key/.crt
#   Prioridad 2: *.key + *.crt / *.cer
#                Clave cifrada → nginx la carga nativamente via ssl_password_file
#
# password.txt acepta (case-insensitive, igual que el AG):
#   password: mipassphrase  |  passphrase: mipassphrase  |  mipassphrase
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
SSL_PASSWORD_FILE=""

# ── read_passphrase <dir> ─────────────────────────────────────────────────────
# Equivalente exacto de readPassphrase() del AG
read_passphrase() {
  dir="$1"
  pw_file=$(find "$dir" -maxdepth 1 -iname "password.txt" 2>/dev/null | head -1)
  [ -n "$pw_file" ] || { echo ""; return 0; }

  raw=$(cat "$pw_file" | tr -d '\r' | sed '/^[[:space:]]*$/d' | head -1 | sed 's/[[:space:]]*$//')

  matched=$(echo "$raw" | grep -i '^password[[:space:]]*:' \
            | sed 's/^[^:]*:[[:space:]]*//' | sed 's/[[:space:]]*$//')
  [ -z "$matched" ] && matched=$(echo "$raw" | grep -i '^passphrase[[:space:]]*:' \
            | sed 's/^[^:]*:[[:space:]]*//' | sed 's/[[:space:]]*$//')

  if [ -n "$matched" ]; then
    echo "$matched"
  else
    echo "$raw"
  fi
}

# ── is_key_encrypted <keyfile> ────────────────────────────────────────────────
# Equivalente exacto de isKeyEncrypted() del AG
is_key_encrypted() {
  keyfile="$1"
  [ -f "$keyfile" ] || { echo "unknown"; return; }
  if grep -q 'BEGIN ENCRYPTED PRIVATE KEY' "$keyfile" 2>/dev/null; then
    echo "yes"
  elif grep -q 'Proc-Type:' "$keyfile" 2>/dev/null && \
       grep -q 'ENCRYPTED'  "$keyfile" 2>/dev/null; then
    echo "yes"
  else
    echo "no"
  fi
}

# ── log_cert_info <certfile> ──────────────────────────────────────────────────
# Muestra CN, SANs y expiración (requiere openssl CLI — opcional)
log_cert_info() {
  certfile="$1"
  [ -f "$certfile" ] || return 0
  echo "   Certificado: $(basename "$certfile")"
  if ! command -v openssl >/dev/null 2>&1; then
    return 0
  fi
  cn=$(openssl x509 -in "$certfile" -noout -subject 2>/dev/null \
       | sed 's/.*CN[[:space:]]*=[[:space:]]*//' | sed 's/[,\/].*//')
  expiry=$(openssl x509 -in "$certfile" -noout -enddate 2>/dev/null \
           | sed 's/notAfter=//')
  sans=$(openssl x509 -in "$certfile" -noout -ext subjectAltName 2>/dev/null \
         | grep -o 'DNS:[^,]*' | tr '\n' ' ')
  echo "   Dominio (CN): ${cn:-(no CN)}"
  [ -n "$sans" ] && echo "   SANs: ${sans}"
  echo "   Válido hasta: ${expiry:-(desconocido)}"
}

# ── try_find_certs <dir> ──────────────────────────────────────────────────────
# Prioridad: PFX (si hay openssl) → .key/.crt
# Para claves cifradas usa ssl_password_file — NO necesita descifrar con openssl
try_find_certs() {
  dir="$1"

  if [ ! -d "$dir" ]; then
    echo "   ✘ ${dir}  (no existe)"
    return 1
  fi

  passphrase=$(read_passphrase "$dir")
  pass_len=$(printf '%s' "$passphrase" | wc -c)
  echo "   Passphrase: $([ -n "$passphrase" ] && echo "desde password.txt (${pass_len} chars)" || echo 'sin passphrase')"

  # ── Prioridad 1: PFX/P12 (solo si openssl CLI disponible) ───────────────
  pfx=$(find "$dir" -maxdepth 1 \( -iname "*.pfx" -o -iname "*.p12" \) 2>/dev/null | head -1)

  if [ -n "$pfx" ] && command -v openssl >/dev/null 2>&1; then
    tmp_key="/tmp/ssl_nginx.key"
    tmp_cert="/tmp/ssl_nginx.crt"
    pfx_ok=false

    for legacy_flag in "" "-legacy"; do
      err=$(openssl pkcs12 $legacy_flag -in "$pfx" -nocerts -nodes \
              -passin "pass:${passphrase}" -out "$tmp_key" 2>&1) && \
      openssl pkcs12 $legacy_flag -in "$pfx" -clcerts -nokeys \
              -passin "pass:${passphrase}" -out "$tmp_cert" 2>/dev/null && \
      pfx_ok=true && break
      echo "   ⚠️  PFX${legacy_flag:+ (legacy)} error: $(echo "$err" | tail -1)"
    done

    if [ "$pfx_ok" = "true" ]; then
      SSL_KEY="$tmp_key"
      SSL_CERT="$tmp_cert"
      echo "   ✔ ${dir}  (PFX/P12)"
      log_cert_info "$tmp_cert"
      return 0
    fi
    echo "   ⚠️  PFX no se pudo procesar — usando .key/.crt como fallback..."
  elif [ -n "$pfx" ]; then
    echo "   ℹ️  PFX encontrado pero openssl CLI no disponible — usando .key/.crt..."
  fi

  # ── Prioridad 2: .key + .crt/.cer ───────────────────────────────────────
  key=$(find  "$dir" -maxdepth 1 -iname "*.key" 2>/dev/null | head -1)
  cert=$(find "$dir" -maxdepth 1 \( -iname "*.crt" -o -iname "*.cer" \) 2>/dev/null | head -1)

  if [ -n "$key" ] && [ -n "$cert" ]; then
    encrypted=$(is_key_encrypted "$key")
    echo "   Clave cifrada: ${encrypted}"

    if [ "$encrypted" = "yes" ]; then
      if [ -z "$passphrase" ]; then
        echo "   ✘ ${dir}  (.key cifrada pero sin password.txt)"
        return 1
      fi
      # nginx carga claves cifradas nativamente con ssl_password_file
      # NO necesitamos descifrar con openssl
      SSL_PASSWORD_FILE="/tmp/nginx_ssl_password"
      printf '%s' "$passphrase" > "$SSL_PASSWORD_FILE"
      chmod 600 "$SSL_PASSWORD_FILE"
      echo "   ✔ ${dir}  (.key cifrada — nginx usará ssl_password_file)"
    else
      echo "   ✔ ${dir}  (.key sin cifrar)"
    fi

    SSL_KEY="$key"
    SSL_CERT="$cert"
    log_cert_info "$cert"
    return 0
  fi

  echo "   ✘ ${dir}  (sin certificados: se necesita .key + .crt o .pfx/.p12)"
  return 1
}

# ── Generadores de config nginx ───────────────────────────────────────────────
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
    # HTTP activo en paralelo (igual que el AG)
    printf 'server {\n'
    printf '    listen %s;\n' "$PORT"
    printf '    server_name _;\n'
    printf '    root /usr/share/nginx/html;\n'
    printf '    index index.html;\n\n'
    location_block
    printf '}\n\n'

    # HTTPS
    printf 'server {\n'
    printf '    listen %s ssl;\n' "$SSL_PORT"
    printf '    server_name _;\n\n'
    printf '    ssl_certificate     %s;\n' "$SSL_CERT"
    printf '    ssl_certificate_key %s;\n' "$SSL_KEY"
    [ -n "$SSL_PASSWORD_FILE" ] && \
    printf '    ssl_password_file   %s;\n' "$SSL_PASSWORD_FILE"
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
    echo "⚠️  USE_SSL=true pero sin certificados válidos — continuando solo HTTP"
    echo "   Formatos soportados: .pfx/.p12  o  .key + .crt/.cer  (con password.txt opcional)"
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
