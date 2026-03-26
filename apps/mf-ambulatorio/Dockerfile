# ── Stage 1: Build ──────────────────────────────────────────
FROM node:20-alpine AS builder
ARG VERDACCIO_URL=http://host.docker.internal:10100
WORKDIR /app

COPY package*.json .npmrc ./
COPY apps/mf-shell/package.json       apps/mf-shell/
COPY apps/mf-auth/package.json        apps/mf-auth/
COPY apps/mf-home/package.json        apps/mf-home/
COPY apps/mf-emergency/package.json   apps/mf-emergency/
COPY apps/mf-hospital/package.json    apps/mf-hospital/
COPY apps/mf-ambulatorio/package.json apps/mf-ambulatorio/
COPY apps/mf-auditoria/package.json   apps/mf-auditoria/

RUN sed -i "s|http://localhost:10100|${VERDACCIO_URL}|g" .npmrc 2>/dev/null || true \
 && sed -i "s|http://localhost:4873|${VERDACCIO_URL}|g; s|http://localhost:10100|${VERDACCIO_URL}|g" package-lock.json 2>/dev/null || true

RUN npm ci

COPY apps/mf-ambulatorio ./apps/mf-ambulatorio
RUN npm run build -w apps/mf-ambulatorio

# ── Stage 2: Serve ───────────────────────────────────────────
FROM nginx:alpine
COPY --from=builder /app/apps/mf-ambulatorio/dist /usr/share/nginx/html
COPY apps/mf-ambulatorio/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
