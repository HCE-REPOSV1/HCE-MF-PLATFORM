# syntax=docker/dockerfile:1
# ── Stage 1: Build ──────────────────────────────────────────
FROM node:20-alpine AS builder
ARG VERDACCIO_URL=http://host.docker.internal:10100
ARG VITE_REMOTE_SHELL=http://localhost:10500/remoteEntry.js
ARG VITE_REMOTE_TRIAGE=http://localhost:10510/remoteEntry.js
ARG VITE_APIGW_CNL_WEB_EMERGENCY=http://localhost:10602
ARG VITE_APIGW_CLN_CROSS=http://localhost:10601
ARG VITE_EMERGENCY_DECRYPT_KEY
WORKDIR /app

COPY package*.json .npmrc ./
COPY apps/mf-emergency/package.json   apps/mf-emergency/

RUN --mount=type=cache,target=/root/.npm \
    sed -i "s|http://localhost:10100|${VERDACCIO_URL}|g" .npmrc 2>/dev/null || true \
 && sed -i "s|http://localhost:4873|${VERDACCIO_URL}|g; s|http://localhost:10100|${VERDACCIO_URL}|g" package-lock.json 2>/dev/null || true \
 && echo "registry=${VERDACCIO_URL}" >> .npmrc \
 && echo "replace-registry-host=always" >> .npmrc \
 && npm install --install-strategy=nested

COPY apps/mf-emergency ./apps/mf-emergency
RUN VITE_REMOTE_SHELL=${VITE_REMOTE_SHELL} \
    VITE_REMOTE_TRIAGE=${VITE_REMOTE_TRIAGE} \
    VITE_APIGW_CNL_WEB_EMERGENCY=${VITE_APIGW_CNL_WEB_EMERGENCY} \
    VITE_APIGW_CLN_CROSS=${VITE_APIGW_CLN_CROSS} \
    VITE_EMERGENCY_DECRYPT_KEY=${VITE_EMERGENCY_DECRYPT_KEY} \
    npm run build -w apps/mf-emergency

# ── Stage 2: Serve ───────────────────────────────────────────
FROM nginx:alpine
COPY --from=builder /app/apps/mf-emergency/dist /usr/share/nginx/html
COPY docker/nginx-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
EXPOSE 80 443
ENTRYPOINT ["/docker-entrypoint.sh"]
