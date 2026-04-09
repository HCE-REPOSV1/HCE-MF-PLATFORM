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
#               spa    → fallback a index.html (mf-shell)
#               remote → fallback 404 + CORS * (microfronts remotos)
#
# Formatos de certificado soportados (igual que el AG):
#   Prioridad 1: .pfx / .p12  (con password.txt opcional)
#                Si el PFX no puede descifrarse → fallback a .key/.crt
#   Prioridad 2: *.key + *.crt / *.cer  (clave cifrada → se descifra con password.txt)
#
# password.txt acepta cualquiera de estos formatos (case-insensitive, igual que el AG):
#   password: mipassphrase
#   Password: mipassphrase
#   passphrase: mipassphrase
#   mipassphrase          ← línea simple sin prefijo
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

# ── read_passphrase <dir> ─────────────────────────────────────────────────────
# Equivalente exacto de readPassphrase() del AG:
#   1. Busca password.txt (case-insensitive en nombre de archivo)
#   2. Intenta match /^(?:password|passphrase)\s*:\s*(.+)$/i  → usa el valor
#   3. Si no hay match → usa la línea cruda (passphrase directa)
read_passphrase() {
  dir="$1"
  pw_file=$(find "$dir" -maxdepth 1 -iname "password.txt" 2>/dev/null | head -1)
  [ -n "$pw_file" ] || { echo ""; return 0; }

  # Leer todo el archivo, quitar \r y \n al final (igual que JS .trim())
  raw=$(cat "$pw_file" | tr -d '\r' | sed '/^[[:space:]]*$/d' | head -1 | sed 's/[[:space:]]*$//')

  # Intentar match ^(password|passphrase)\s*:\s*(.+)$ case-insensitive — igual que AG
  matched=$(echo "$raw" | grep -i '^password[[:space:]]*:' \
            | sed 's/^[^:]*:[[:space:]]*//' | sed 's/[[:space:]]*$//')
  [ -z "$matched" ] && matched=$(echo "$raw" | grep -i '^passphrase[[:space:]]*:' \
            | sed 's/^[^:]*:[[:space:]]*//' | sed 's/[[:space:]]*$//')

  if [ -n "$matched" ]; then
    echo "$matched"
  else
    # Sin prefijo password:/passphrase: → usar línea cruda como passphrase
    echo "$raw"
  fi
}

# ── log_cert_info <certfile> ─────────────────────────────────────────────────
# Equivalente de logCertInfo() del AG — muestra CN, SANs y fecha de expiración
log_cert_info() {
  certfile="$1"
  [ -f "$certfile" ] || return 0
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

# ── is_key_encrypted <keyfile> ────────────────────────────────────────────────
# Equivalente exacto de isKeyEncrypted() del AG:
#   Detecta PKCS#8 cifrado  → "BEGIN ENCRYPTED PRIVATE KEY"
#   Detecta PEM tradicional → "Proc-Type:" + "ENCRYPTED"
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

# ── try_find_certs <dir> ──────────────────────────────────────────────────────
# Equivalente de detectCertFormat() + buildHttpsOptions() del AG.
# Prioridad: PFX/P12 → fallback .key/.crt
# Resultado: sets SSL_KEY y SSL_CERT, returns 0 si OK
try_find_certs() {
  dir="$1"

  if [ ! -d "$dir" ]; then
    echo "   ✘ ${dir}  (no existe)"
    return 1
  fi

  passphrase=$(read_passphrase "$dir")

  # ── Prioridad 1: PFX / P12 ──────────────────────────────────────────────
  pfx=$(find "$dir" -maxdepth 1 \( -iname "*.pfx" -o -iname "*.p12" \) 2>/dev/null | head -1)

  if [ -n "$pfx" ]; then
    tmp_key="/tmp/ssl_nginx.key"
    tmp_cert="/tmp/ssl_nginx.crt"

    echo "   Passphrase: $([ -n "$passphrase" ] && echo 'desde password.txt' || echo 'sin passphrase')"

    pfx_ok=false
    # Intentar primero sin -legacy, luego con -legacy (OpenSSL 3.x con PFX legacy)
    for legacy_flag in "" "-legacy"; do
      if openssl pkcs12 $legacy_flag -in "$pfx" -nocerts -nodes \
           -passin "pass:${passphrase}" -out "$tmp_key" 2>/dev/null && \
         openssl pkcs12 $legacy_flag -in "$pfx" -clcerts -nokeys \
           -passin "pass:${passphrase}" -out "$tmp_cert" 2>/dev/null; then
        pfx_ok=true
        break
      fi
    done

    if [ "$pfx_ok" = "true" ]; then
      SSL_KEY="$tmp_key"
      SSL_CERT="$tmp_cert"
      echo "   ✔ ${dir}  (PFX/P12)"
      log_cert_info "$tmp_cert"
      return 0
    fi

    # PFX no se pudo descifrar → fallback a .key/.crt igual que el AG
    echo "   ⚠️  PFX cifrado — buscando .key/.crt como fallback..."
  fi

  # ── Prioridad 2: .key + .crt/.cer ───────────────────────────────────────
  key=$(find  "$dir" -maxdepth 1 -iname "*.key" 2>/dev/null | head -1)
  cert=$(find "$dir" -maxdepth 1 \( -iname "*.crt" -o -iname "*.cer" \) 2>/dev/null | head -1)

  if [ -n "$key" ] && [ -n "$cert" ]; then
    encrypted=$(is_key_encrypted "$key")
    echo "   Clave cifrada: ${encrypted}$([ -n "$passphrase" ] && echo ' (passphrase desde password.txt)' || echo '')"

    if [ "$encrypted" = "yes" ]; then
      if [ -z "$passphrase" ]; then
        echo "   ✘ ${dir}  (.key cifrada pero sin password.txt)"
        return 1
      fi
      # Descifrar la clave — nginx no acepta claves cifradas directamente
      # Intentar rsa, pkey, y con -legacy (OpenSSL 3.x)
      tmp_key="/tmp/ssl_nginx.key"
      key_ok=false
      for cmd in "openssl rsa" "openssl pkey" "openssl rsa -legacy" "openssl pkey -legacy"; do
        # shellcheck disable=SC2086
        if $cmd -in "$key" -passin "pass:${passphrase}" -out "$tmp_key" 2>/dev/null; then
          key_ok=true
          break
        fi
      done
      if [ "$key_ok" = "true" ]; then
        SSL_KEY="$tmp_key"
        echo "   ✔ ${dir}  (.key cifrada — descifrada OK)"
        log_cert_info "$cert"
      else
        echo "   ✘ ${dir}  (.key cifrada — passphrase incorrecta)"
        return 1
      fi
    else
      SSL_KEY="$key"
    fi

    SSL_CERT="$cert"
    echo "   ✔ ${dir}  (.key + .crt)"
    log_cert_info "$cert"
    return 0
  fi

  echo "   ✘ ${dir}  (sin certificados)"
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
    # HTTP activo en paralelo (igual que el AG — no redirige, sirve ambos)
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
