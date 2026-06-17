#!/usr/bin/env bash
# Repair kam-nginx + wire upstream to a running app slot.
# Usage on VPS: bash deploy/ci/fix-nginx.sh
set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
cd "$DEPLOY_DIR"

log() { echo "==> $*"; }

if [ ! -f .env.production ]; then
  echo "ERROR: .env.production not found"
  exit 1
fi

# shellcheck source=/dev/null
set -a && source .env.production && set +a

log "Syncing latest code from main..."
git fetch origin main
git reset --hard origin/main

if [ -n "${APP_DOMAIN:-}" ]; then
  DOMAIN="$APP_DOMAIN"
elif [ -n "${VPS_IP:-}" ]; then
  DOMAIN="$(echo "$VPS_IP" | tr '.' '-').sslip.io"
elif [ -n "${NEXT_PUBLIC_APP_URL:-}" ]; then
  DOMAIN="${NEXT_PUBLIC_APP_URL#https://}"
  DOMAIN="${DOMAIN#http://}"
  DOMAIN="${DOMAIN%%/*}"
else
  echo "ERROR: Set VPS_IP, APP_DOMAIN, or NEXT_PUBLIC_APP_URL in .env.production"
  exit 1
fi

log "Domain: $DOMAIN"
log "Writing HTTPS nginx config..."
sed "s/YOUR_DOMAIN/${DOMAIN}/g" deploy/nginx/docker/default.conf \
  > deploy/nginx/docker/default.conf.active

UPSTREAM_TARGET="127.0.0.1:65535 down"
if docker ps --format '{{.Names}}' | grep -qx kam-app-green; then
  UPSTREAM_TARGET="app-green:3000"
elif docker ps --format '{{.Names}}' | grep -qx kam-app-blue; then
  UPSTREAM_TARGET="app-blue:3000"
fi
log "Nginx upstream: server ${UPSTREAM_TARGET};"
echo "server ${UPSTREAM_TARGET};" > deploy/nginx/upstream/active.conf

log "Testing nginx config..."
docker compose run --rm --no-deps nginx nginx -t

log "Recreating kam-nginx..."
docker compose up -d nginx --force-recreate --no-deps

sleep 3
docker ps --filter name=kam-nginx
if docker ps --format '{{.Names}}' | grep -qx kam-nginx; then
  docker compose exec -T nginx wget -qO- "http://${UPSTREAM_TARGET%% *}/api/health" || true
fi
log "Try: curl https://${DOMAIN}/api/health"
