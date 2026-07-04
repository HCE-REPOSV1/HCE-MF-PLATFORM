# syntax=docker/dockerfile:1
# ── Stage 1: Build ──────────────────────────────────────────
FROM node:20-alpine AS builder
ARG VERDACCIO_URL=http://host.docker.internal:10100
# URLs de producción — se hornean en el bundle en build time
ARG VITE_APIGW_CNL_CROSS=http://localhost:10601
ARG VITE_REMOTE_AUTH=http://localhost:10501/remoteEntry.js
ARG VITE_REMOTE_HOME=http://localhost:10502/remoteEntry.js
ARG VITE_REMOTE_EMERGENCY=http://localhost:10503/remoteEntry.js
ARG VITE_REMOTE_HOSPITAL=http://localhost:10504/remoteEntry.js
ARG VITE_REMOTE_AMBULATORIO=http://localhost:10505/remoteEntry.js
ARG VITE_REMOTE_AUDITORIA=http://localhost:10506/remoteEntry.js
ARG VITE_REMOTE_HEADER=http://localhost:10507/remoteEntry.js
ARG VITE_REMOTE_SIDEBAR=http://localhost:10508/remoteEntry.js
ARG VITE_REMOTE_FOOTER=http://localhost:10509/remoteEntry.js
ARG VITE_REMOTE_TRIAGE=http://localhost:10510/remoteEntry.js
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
COPY apps/mf-header/package.json      apps/mf-header/
COPY apps/mf-sidebar/package.json      apps/mf-sidebar/
COPY apps/mf-footer/package.json      apps/mf-footer/
COPY apps/mf-triage/package.json      apps/mf-triage/

# Cache mount: reutiliza paquetes descargados entre builds aunque se invalide la capa
RUN --mount=type=cache,target=/root/.npm \
    sed -i "s|http://localhost:10100|${VERDACCIO_URL}|g" .npmrc 2>/dev/null || true \
 && sed -i "s|http://localhost:4873|${VERDACCIO_URL}|g; s|http://localhost:10100|${VERDACCIO_URL}|g" package-lock.json 2>/dev/null || true \
 && echo "registry=${VERDACCIO_URL}" >> .npmrc \
 && echo "replace-registry-host=always" >> .npmrc \
 && npm install --install-strategy=nested

# Solo el código fuente de este microfrontend
COPY apps/mf-shell ./apps/mf-shell
RUN VITE_APIGW_CNL_CROSS=${VITE_APIGW_CNL_CROSS} \
    VITE_REMOTE_AUTH=${VITE_REMOTE_AUTH} \
    VITE_REMOTE_HOME=${VITE_REMOTE_HOME} \
    VITE_REMOTE_EMERGENCY=${VITE_REMOTE_EMERGENCY} \
    VITE_REMOTE_HOSPITAL=${VITE_REMOTE_HOSPITAL} \
    VITE_REMOTE_AMBULATORIO=${VITE_REMOTE_AMBULATORIO} \
    VITE_REMOTE_AUDITORIA=${VITE_REMOTE_AUDITORIA} \
    VITE_REMOTE_HEADER=${VITE_REMOTE_HEADER} \
    VITE_REMOTE_SIDEBAR=${VITE_REMOTE_SIDEBAR} \
    VITE_REMOTE_FOOTER=${VITE_REMOTE_FOOTER} \
    VITE_REMOTE_TRIAGE=${VITE_REMOTE_TRIAGE} \
    npm run build -w apps/mf-shell

# ── Stage 2: Serve ───────────────────────────────────────────
FROM nginx:alpine
COPY --from=builder /app/apps/mf-shell/dist /usr/share/nginx/html
COPY docker/nginx-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
EXPOSE 80 443
ENTRYPOINT ["/docker-entrypoint.sh"]
