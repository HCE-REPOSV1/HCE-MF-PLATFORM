#!/bin/sh
# ─────────────────────────────────────────────────────────────
# Construye los servicios de docker-compose.dev.yml en tandas
# (2 a la vez por defecto) en vez de todos en paralelo, para
# evitar el ENOSPC documentado en el README ("Producción (Docker)"
# -> nota de "no construyas las 11 imagenes en paralelo").
#
# Uso:
#   ./scripts/build-mf-batched.sh                # tandas de 2, sin --no-cache
#   ./scripts/build-mf-batched.sh --jobs 1        # de a una (si 2 sigue fallando)
#   ./scripts/build-mf-batched.sh --no-cache      # fuerza rebuild completo
#   ./scripts/build-mf-batched.sh --jobs 2 --no-cache
#
# Requiere correrse desde la raiz del repo (donde vive
# docker-compose.dev.yml).
# ─────────────────────────────────────────────────────────────
set -e

COMPOSE_FILE="docker-compose.dev.yml"
JOBS=2
BUILD_ARGS=""

while [ $# -gt 0 ]; do
  case "$1" in
    --jobs)
      JOBS="$2"
      shift 2
      ;;
    --no-cache)
      BUILD_ARGS="$BUILD_ARGS --no-cache"
      shift
      ;;
    *)
      echo "Argumento desconocido: $1" >&2
      exit 1
      ;;
  esac
done

if [ ! -f "$COMPOSE_FILE" ]; then
  echo "ERROR: no se encontro $COMPOSE_FILE — correr este script desde la raiz del repo." >&2
  exit 1
fi

SERVICES=$(docker compose -f "$COMPOSE_FILE" config --services)
TOTAL=$(echo "$SERVICES" | wc -l)

echo ">>> $TOTAL servicios encontrados, construyendo de a $JOBS ..."

BATCH=""
COUNT=0
BATCH_NUM=0

build_batch() {
  [ -z "$1" ] && return 0
  BATCH_NUM=$((BATCH_NUM + 1))
  echo ""
  echo ">>> Tanda $BATCH_NUM: $1"
  # shellcheck disable=SC2086
  docker compose -f "$COMPOSE_FILE" build $BUILD_ARGS $1
}

for svc in $SERVICES; do
  BATCH="$BATCH $svc"
  COUNT=$((COUNT + 1))
  if [ "$COUNT" -ge "$JOBS" ]; then
    build_batch "$BATCH"
    BATCH=""
    COUNT=0
  fi
done
build_batch "$BATCH"

echo ""
echo ">>> Todas las imagenes construidas. Verificando..."
BUILT=$(docker images --format '{{.Repository}}' | grep -c '^hce-mf-platform' || true)
echo "    $BUILT imagenes hce-mf-platform-* encontradas (esperado: $TOTAL)."

echo ""
echo ">>> Levantando servicios (sin --build, las imagenes ya existen) ..."
docker compose -f "$COMPOSE_FILE" up -d

echo ">>> Listo."
