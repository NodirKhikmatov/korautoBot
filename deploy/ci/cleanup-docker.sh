#!/usr/bin/env bash
# Free disk space on VPS — run when deploy fails with "no space left on device".
# Usage on VPS: bash deploy/ci/cleanup-docker.sh
set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
cd "$DEPLOY_DIR"

log() { echo "==> $*"; }

log "Disk usage before cleanup:"
df -h / /var/lib/docker 2>/dev/null || df -h /

if command -v docker >/dev/null 2>&1; then
  log "Docker disk usage:"
  docker system df 2>/dev/null || true

  log "Removing stopped app containers (running slot is kept)..."
  for name in kam-app-blue kam-app-green; do
    if docker ps --format '{{.Names}}' | grep -qx "$name"; then
      log "  keeping running: $name"
    else
      docker rm -f "$name" 2>/dev/null || true
    fi
  done

  log "Removing other stopped containers..."
  docker container prune -f

  log "Removing dangling images..."
  docker image prune -f

  log "Removing unused images (not used by any container)..."
  docker image prune -af

  log "Removing build cache..."
  docker builder prune -af 2>/dev/null || true

  log "Docker disk usage after cleanup:"
  docker system df 2>/dev/null || true
else
  echo "docker not found"
fi

log "Disk usage after cleanup:"
df -h / /var/lib/docker 2>/dev/null || df -h /
