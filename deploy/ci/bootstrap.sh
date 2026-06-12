#!/usr/bin/env bash
# First-time stack bootstrap on VPS (infrastructure only — not app deploy).
# Run once after cloning the repo and creating .env.production.
set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
cd "$DEPLOY_DIR"

DOMAIN="${APP_DOMAIN:?Set APP_DOMAIN (e.g. app.example.com)}"

if [ ! -f .env.production ]; then
  echo "ERROR: Create .env.production on the VPS first"
  exit 1
fi

sed -i "s/YOUR_DOMAIN/${DOMAIN}/g" deploy/nginx/docker/default.conf
sed -i "s/YOUR_DOMAIN/${DOMAIN}/g" deploy/nginx/docker/default-http.conf

cp deploy/nginx/docker/default-http.conf deploy/nginx/docker/default.conf.active

echo "==> Starting base stack (HTTP-only nginx + certbot + app slots)..."
export IMAGE_REGISTRY="${IMAGE_REGISTRY:-ghcr.io/example/korea-auto-market}"
export BLUE_IMAGE_TAG="${BLUE_IMAGE_TAG:-latest}"
export GREEN_IMAGE_TAG="${GREEN_IMAGE_TAG:-latest}"

docker compose up -d nginx certbot app-blue app-green

echo "==> Obtaining Let's Encrypt certificate for ${DOMAIN}..."
docker compose run --rm --entrypoint certbot certbot certonly \
  --webroot -w /var/www/certbot \
  -d "$DOMAIN" \
  --email "${CERTBOT_EMAIL:-admin@${DOMAIN}}" \
  --agree-tos \
  --no-eff-email \
  --non-interactive

cp deploy/nginx/docker/default.conf deploy/nginx/docker/default.conf.active
docker compose restart nginx

echo "Bootstrap complete. Configure GitHub Actions secrets and push to main to deploy."
