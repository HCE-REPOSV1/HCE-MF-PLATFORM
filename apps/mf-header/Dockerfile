# syntax=docker/dockerfile:1
# ── Stage 1: Build ──────────────────────────────────────────
FROM node:20-alpine AS builder
ARG VERDACCIO_URL=http://host.docker.internal:10100
ARG VITE_REMOTE_SHELL=http://localhost:10500/remoteEntry.js
ARG VITE_APIGE_CNL_CROSS=http://localhost:10601
ARG VITE_APIGW_CNL_WEB_EMERGENCY=http://localhost:10602
WORKDIR /app

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

RUN --mount=type=cache,target=/root/.npm \
    sed -i "s|http://localhost:10100|${VERDACCIO_URL}|g" .npmrc 2>/dev/null || true \
 && sed -i "s|http://localhost:4873|${VERDACCIO_URL}|g; s|http://localhost:10100|${VERDACCIO_URL}|g" package-lock.json 2>/dev/null || true \
 && echo "registry=${VERDACCIO_URL}" >> .npmrc \
 && echo "replace-registry-host=always" >> .npmrc \
 && npm install --install-strategy=nested

COPY apps/mf-header ./apps/mf-header
RUN VITE_REMOTE_SHELL=${VITE_REMOTE_SHELL} \
    VITE_APIGE_CNL_CROSS=${VITE_APIGE_CNL_CROSS} \
    VITE_APIGW_CNL_WEB_EMERGENCY=${VITE_APIGW_CNL_WEB_EMERGENCY} \
    npm run build -w apps/mf-header

# ── Stage 2: Serve ───────────────────────────────────────────
FROM nginx:alpine
COPY --from=builder /app/apps/mf-header/dist /usr/share/nginx/html
COPY docker/nginx-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
EXPOSE 80 443
ENTRYPOINT ["/docker-entrypoint.sh"]
