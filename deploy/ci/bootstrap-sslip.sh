#!/usr/bin/env bash
# Bootstrap with free sslip.io subdomain + Let's Encrypt (no purchased domain).
#
# Example IP 158.247.234.119 → 158-247-234-119.sslip.io
#
# Usage on VPS:
#   export VPS_IP=158.247.234.119
#   export CERTBOT_EMAIL=you@gmail.com
#   bash deploy/ci/bootstrap-sslip.sh
set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
cd "$DEPLOY_DIR"

log() { echo "==> $*"; }

if [ ! -f .env.production ]; then
  echo "ERROR: Create .env.production first (cp .env.production.example .env.production)"
  exit 1
fi

# shellcheck source=/dev/null
set -a && source .env.production && set +a

if [ -n "${APP_DOMAIN:-}" ]; then
  DOMAIN="$APP_DOMAIN"
elif [ -n "${VPS_IP:-}" ]; then
  DOMAIN="$(echo "$VPS_IP" | tr '.' '-').sslip.io"
else
  echo "ERROR: Set VPS_IP (e.g. 158.247.234.119) or APP_DOMAIN"
  exit 1
fi

PUBLIC_URL="https://${DOMAIN}"
DEFAULT_REGISTRY="ghcr.io/nodirkhikmatov/korautobot"
IMAGE_REGISTRY="${IMAGE_REGISTRY:-$DEFAULT_REGISTRY}"

# GHCR requires lowercase; fix placeholder from .env.production.example
if [[ "$IMAGE_REGISTRY" == *"YOUR_"* ]] || [[ "$IMAGE_REGISTRY" == *"korAvtotelegram"* ]]; then
  IMAGE_REGISTRY="$DEFAULT_REGISTRY"
fi
IMAGE_REGISTRY="$(echo "$IMAGE_REGISTRY" | tr '[:upper:]' '[:lower:]')"

log "Domain: $DOMAIN"
log "Public URL: $PUBLIC_URL"
log "Image registry: $IMAGE_REGISTRY"

sed -i "s|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=${PUBLIC_URL}|" .env.production
sed -i "s|IMAGE_REGISTRY=.*|IMAGE_REGISTRY=${IMAGE_REGISTRY}|" .env.production
log "Updated .env.production (NEXT_PUBLIC_APP_URL, IMAGE_REGISTRY)"

sed -i "s/YOUR_DOMAIN/${DOMAIN}/g" deploy/nginx/docker/default.conf
sed -i "s/YOUR_DOMAIN/${DOMAIN}/g" deploy/nginx/docker/default-http.conf

cp deploy/nginx/docker/default-http.conf deploy/nginx/docker/default.conf.active
echo "server app-blue:3000;" > deploy/nginx/upstream/active.conf

export IMAGE_REGISTRY
export BLUE_IMAGE_TAG="${BLUE_IMAGE_TAG:-latest}"
export GREEN_IMAGE_TAG="${GREEN_IMAGE_TAG:-latest}"

log "Starting Nginx + Certbot (HTTP only — apps start after SSL)..."
docker compose up -d nginx certbot --no-deps

log "Requesting Let's Encrypt certificate..."
docker compose run --rm --entrypoint certbot certbot certonly \
  --webroot -w /var/www/certbot \
  -d "$DOMAIN" \
  --email "${CERTBOT_EMAIL:-admin@${DOMAIN}}" \
  --agree-tos \
  --no-eff-email \
  --non-interactive

log "Enabling HTTPS in Nginx..."
cp deploy/nginx/docker/default.conf deploy/nginx/docker/default.conf.active
docker compose restart nginx

log "Pulling application images (if available on GHCR)..."
if docker pull "${IMAGE_REGISTRY}:latest" 2>/dev/null; then
  log "Starting app containers..."
  docker compose up -d app-blue app-green
else
  log "WARN: No image on GHCR yet. Push to main branch, then GitHub Actions will deploy."
fi

echo ""
echo "=============================================="
echo " sslip.io bootstrap complete"
echo "=============================================="
echo " App URL:     ${PUBLIC_URL}"
echo " Health:      ${PUBLIC_URL}/api/health"
echo ""
echo " GitHub → Settings → Variables:"
echo "   NEXT_PUBLIC_APP_URL = ${PUBLIC_URL}"
echo ""
echo " Telegram Bot → BotFather → Mini App URL:"
echo "   ${PUBLIC_URL}"
echo ""
echo " Next: git push origin main (GitHub Actions deploy)"
echo "=============================================="
