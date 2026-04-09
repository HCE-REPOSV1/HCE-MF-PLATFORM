# syntax=docker/dockerfile:1
# ── Stage 1: Build ──────────────────────────────────────────
FROM node:20-alpine AS builder
ARG VERDACCIO_URL=http://host.docker.internal:10100
WORKDIR /app

# Manifests raíz + todos los workspaces (necesario para npm install en monorepo)
COPY package*.json .npmrc ./
COPY apps/mf-shell/package.json       apps/mf-shell/
COPY apps/mf-auth/package.json        apps/mf-auth/
COPY apps/mf-home/package.json        apps/mf-home/
COPY apps/mf-emergency/package.json   apps/mf-emergency/
COPY apps/mf-hospital/package.json    apps/mf-hospital/
COPY apps/mf-ambulatorio/package.json apps/mf-ambulatorio/
COPY apps/mf-auditoria/package.json   apps/mf-auditoria/

# Cache mount: reutiliza paquetes descargados entre builds aunque se invalide la capa
RUN --mount=type=cache,target=/root/.npm \
    sed -i "s|http://localhost:10100|${VERDACCIO_URL}|g" .npmrc 2>/dev/null || true \
 && sed -i "s|http://localhost:4873|${VERDACCIO_URL}|g; s|http://localhost:10100|${VERDACCIO_URL}|g" package-lock.json 2>/dev/null || true \
 && echo "registry=${VERDACCIO_URL}" >> .npmrc \
 && echo "replace-registry-host=always" >> .npmrc \
 && npm install --install-strategy=nested

# Solo el código fuente de este microfrontend
COPY apps/mf-shell ./apps/mf-shell
RUN npm run build -w apps/mf-shell

# ── Stage 2: Serve ───────────────────────────────────────────
FROM nginx:alpine
# Sin acceso a internet → copiamos el binario openssl desde el builder (node:alpine ya lo incluye)
# nginx:alpine ya tiene libssl/libcrypto, solo falta el CLI
COPY --from=builder /usr/bin/openssl /usr/bin/openssl
COPY --from=builder /app/apps/mf-shell/dist /usr/share/nginx/html
COPY docker/nginx-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
EXPOSE 80 443
ENTRYPOINT ["/docker-entrypoint.sh"]
