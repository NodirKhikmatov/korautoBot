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
warn() { echo "WARN: $*" >&2; }

stop_host_web_servers() {
  if systemctl is-active --quiet nginx 2>/dev/null; then
    log "Stopping host nginx (port 80 must be free for Docker)..."
    systemctl stop nginx
    systemctl disable nginx 2>/dev/null || true
  fi
  if systemctl is-active --quiet apache2 2>/dev/null; then
    log "Stopping host apache2..."
    systemctl stop apache2
    systemctl disable apache2 2>/dev/null || true
  fi
}

check_port_80_free() {
  if ss -tlnH 'sport = :80' 2>/dev/null | grep -q .; then
    warn "Port 80 is in use. Stop the service above, then re-run this script."
    ss -tlnp | grep ':80 ' || true
    exit 1
  fi
}

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

# Substitute domain only into runtime files — do not modify tracked nginx templates (keeps git pull clean).
sed "s/YOUR_DOMAIN/${DOMAIN}/g" deploy/nginx/docker/default-http.conf \
  > deploy/nginx/docker/default.conf.active
echo "server app-blue:3000 resolve;" > deploy/nginx/upstream/active.conf

export IMAGE_REGISTRY
export BLUE_IMAGE_TAG="${BLUE_IMAGE_TAG:-latest}"
export GREEN_IMAGE_TAG="${GREEN_IMAGE_TAG:-latest}"

stop_host_web_servers

log "Starting Certbot renewal sidecar..."
docker compose up -d certbot --no-deps

log "Stopping Docker nginx (if running) before certificate request..."
docker compose stop nginx 2>/dev/null || true
check_port_80_free

log "Vultr panel: Firewall → allow inbound TCP 80 and 443 (if not already)."
log "Requesting Let's Encrypt certificate (standalone on port 80)..."
docker compose run --rm -p 80:80 --entrypoint certbot certbot certonly \
  --standalone \
  -d "$DOMAIN" \
  --email "${CERTBOT_EMAIL:-admin@${DOMAIN}}" \
  --agree-tos \
  --no-eff-email \
  --non-interactive

log "Enabling HTTPS in Nginx..."
sed "s/YOUR_DOMAIN/${DOMAIN}/g" deploy/nginx/docker/default.conf \
  > deploy/nginx/docker/default.conf.active
docker compose up -d nginx certbot --no-deps

log "Pulling application images (if available on GHCR)..."
if docker pull "${IMAGE_REGISTRY}:latest" 2>/dev/null; then
  log "Starting app containers..."
  docker compose --profile app up -d app-blue app-green
else
  log "WARN: No image on GHCR yet. Push to main from your Mac — GitHub Actions will build and deploy."
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
echo " Next: on your Mac (not VPS): git push origin main"
echo "=============================================="
