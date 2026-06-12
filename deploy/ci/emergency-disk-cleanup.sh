#!/usr/bin/env bash
# Emergency VPS disk cleanup when root is 100% full and deploy fails.
# Run on VPS: cd /var/www/korea-auto-market && bash deploy/ci/emergency-disk-cleanup.sh
set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
cd "$DEPLOY_DIR"

log() { echo "==> $*"; }

log "Disk BEFORE:"
df -h /

log "Largest directories under /var:"
du -xh --max-depth=1 /var 2>/dev/null | sort -h | tail -10 || true

if command -v docker >/dev/null 2>&1; then
  log "Docker usage:"
  docker system df 2>/dev/null || true

  log "Containers:"
  docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Size}}" 2>/dev/null || true

  log "App images:"
  docker images ghcr.io/nodirkhikmatov/korautobot \
    --format "table {{.Tag}}\t{{.Size}}\t{{.ID}}" 2>/dev/null || true

  # Stopped slots still pin old image layers — remove them first.
  log "Removing stopped app containers (keeps running slot)..."
  for name in kam-app-blue kam-app-green; do
    if docker ps --format '{{.Names}}' | grep -qx "$name"; then
      log "  keeping running: $name"
    else
      docker rm -f "$name" 2>/dev/null || true
    fi
  done

  log "Removing old GHCR images (not used by running containers)..."
  docker image prune -af 2>/dev/null || true

  log "Removing dangling build cache..."
  docker builder prune -af 2>/dev/null || true

  # One-off migrate containers / failed pulls
  docker container prune -f 2>/dev/null || true
fi

log "System logs and apt cache..."
journalctl --vacuum-size=100M 2>/dev/null || true
apt-get clean 2>/dev/null || true
rm -f /var/log/*.gz /var/log/*.1 2>/dev/null || true

log "Docker AFTER cleanup:"
docker system df 2>/dev/null || true

log "Disk AFTER:"
df -h /

AVAIL=$(df -BM / | awk 'NR==2 {print $4}' | tr -d 'M')
if [ "${AVAIL:-0}" -lt 1500 ]; then
  echo ""
  echo "WARNING: Still less than 1.5GB free (${AVAIL}MB)."
  echo "Run manually:"
  echo "  docker images"
  echo "  docker rmi -f <old-image-id>   # remove old commit tags"
  echo "Or resize VPS disk in Vultr panel (recommended for 23GB plan)."
fi
