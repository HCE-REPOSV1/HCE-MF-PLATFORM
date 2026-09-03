# syntax=docker/dockerfile:1
# ── Stage 1: Build ──────────────────────────────────────────
FROM node:20-alpine AS builder
ARG VERDACCIO_URL=http://host.docker.internal:10100
ARG VITE_REMOTE_SHELL=http://localhost:10500/remoteEntry.js
ARG VITE_APIGW_WEB_EMERGENCY=http://localhost:10602
ARG VITE_APIGW_CLN_CROSS=http://localhost:10601
WORKDIR /app

COPY package*.json .npmrc ./
COPY apps/mf-triage/package.json      apps/mf-triage/

RUN --mount=type=cache,target=/root/.npm \
    sed -i "s|http://localhost:10100|${VERDACCIO_URL}|g" .npmrc 2>/dev/null || true \
 && sed -i "s|http://localhost:4873|${VERDACCIO_URL}|g; s|http://localhost:10100|${VERDACCIO_URL}|g" package-lock.json 2>/dev/null || true \
 && echo "registry=${VERDACCIO_URL}" >> .npmrc \
 && echo "replace-registry-host=always" >> .npmrc \
 && npm install --install-strategy=nested

COPY apps/mf-triage ./apps/mf-triage
RUN VITE_REMOTE_SHELL=${VITE_REMOTE_SHELL} \
    VITE_APIGW_WEB_EMERGENCY=${VITE_APIGW_WEB_EMERGENCY} \
    VITE_APIGW_CLN_CROSS=${VITE_APIGW_CLN_CROSS} \
    npm run build -w apps/mf-triage

# ── Stage 2: Serve ───────────────────────────────────────────
FROM nginx:alpine
COPY --from=builder /app/apps/mf-triage/dist /usr/share/nginx/html
COPY docker/nginx-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
EXPOSE 80 443
ENTRYPOINT ["/docker-entrypoint.sh"]
