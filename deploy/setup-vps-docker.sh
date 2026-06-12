#!/usr/bin/env bash
# One-time Vultr VPS bootstrap for Docker + Compose deployment.
# Usage: sudo bash deploy/setup-vps-docker.sh
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive

echo "==> Installing Docker..."
if ! command -v docker >/dev/null 2>&1; then
  apt-get update -qq
  apt-get install -y ca-certificates curl gnupg ufw git
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -qq
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
fi

echo "==> Configuring firewall..."
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "==> Creating app directory..."
mkdir -p /var/www/korea-auto-market
chown -R "${SUDO_USER:-root}:${SUDO_USER:-root}" /var/www/korea-auto-market

echo ""
echo "VPS Docker bootstrap complete."
echo ""
echo "Next steps:"
echo "  1. Clone repo: git clone <repo> /var/www/korea-auto-market"
echo "  2. cp .env.production.example .env.production  # fill values on VPS"
echo "  3. export APP_DOMAIN=your.domain CERTBOT_EMAIL=you@domain.com"
echo "  4. bash deploy/ci/bootstrap-sslip.sh"
echo "  5. Add GitHub Actions secrets (VPS_HOST, VPS_USER, VPS_SSH_KEY)"
echo "  6. Push to main — deploy runs automatically"
