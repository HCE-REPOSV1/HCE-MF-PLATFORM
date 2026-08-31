# syntax=docker/dockerfile:1
# ── Stage 1: Build ──────────────────────────────────────────
FROM node:20-alpine AS builder
ARG VERDACCIO_URL=http://host.docker.internal:10100
ARG VITE_COMPANY_THEME=csf
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
ARG VITE_REMOTE_CLINICAL_RECORD=http://localhost:10511/assets/remoteEntry.js
WORKDIR /app

# Manifests raíz + workspace propio (Module Federation resuelve los remotes
# por URL en runtime, no como dependencia de build — no hace falta el código
# ni el package.json de los demás microfrontends)
COPY package*.json .npmrc ./
COPY apps/mf-shell/package.json       apps/mf-shell/

# Cache mount: reutiliza paquetes descargados entre builds aunque se invalide la capa
RUN --mount=type=cache,target=/root/.npm \
    sed -i "s|http://localhost:10100|${VERDACCIO_URL}|g" .npmrc 2>/dev/null || true \
 && sed -i "s|http://localhost:4873|${VERDACCIO_URL}|g; s|http://localhost:10100|${VERDACCIO_URL}|g" package-lock.json 2>/dev/null || true \
 && echo "registry=${VERDACCIO_URL}" >> .npmrc \
 && echo "replace-registry-host=always" >> .npmrc \
 && npm install --install-strategy=nested

# Solo el código fuente de este microfrontend
COPY apps/mf-shell ./apps/mf-shell
RUN VITE_COMPANY_THEME=${VITE_COMPANY_THEME} \
    VITE_APIGW_CNL_CROSS=${VITE_APIGW_CNL_CROSS} \
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
    VITE_REMOTE_CLINICAL_RECORD=${VITE_REMOTE_CLINICAL_RECORD} \
    npm run build -w apps/mf-shell

# ── Stage 2: Serve ───────────────────────────────────────────
FROM nginx:alpine
COPY --from=builder /app/apps/mf-shell/dist /usr/share/nginx/html
COPY docker/nginx-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
EXPOSE 80 443
ENTRYPOINT ["/docker-entrypoint.sh"]
