#!/usr/bin/env bash
# Zero-downtime blue-green deploy — invoked ONLY by GitHub Actions.
#
# Flow:
#   1. Git pull (done in workflow before this script)
#   2. Pull Docker images from GHCR
#   3. Recreate container on inactive slot
#   4. Health check → migrations → switch Nginx → stop old slot
set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
cd "$DEPLOY_DIR"

STATE_FILE="deploy/ci/.deploy-state.json"
UPSTREAM_FILE="deploy/nginx/upstream/active.conf"
IMAGE_TAG="${IMAGE_TAG:?IMAGE_TAG is required}"
IMAGE_REGISTRY="${IMAGE_REGISTRY:?IMAGE_REGISTRY is required}"
ROLLBACK="${ROLLBACK:-false}"

log() { echo "==> $*"; }

if [ ! -f .env.production ]; then
  echo "ERROR: .env.production not found on VPS"
  exit 1
fi

# shellcheck source=/dev/null
set -a && source .env.production && set +a

mkdir -p deploy/ci deploy/nginx/upstream

if [ -f "$STATE_FILE" ]; then
  STATE_JSON=$(cat "$STATE_FILE")
else
  STATE_JSON='{"active":"blue","blue":{"tag":""},"green":{"tag":""},"previous":null}'
fi

ACTIVE=$(echo "$STATE_JSON" | node -e "const s=JSON.parse(require('fs').readFileSync(0,'utf8')); process.stdout.write(s.active||'blue')")

if [ "$ACTIVE" = "blue" ]; then
  INACTIVE="green"
else
  INACTIVE="blue"
fi

if [ "$ROLLBACK" = "true" ]; then
  PREV_TAG=$(echo "$STATE_JSON" | node -e "const s=JSON.parse(require('fs').readFileSync(0,'utf8')); process.stdout.write(s.previous?.tag||'')")
  if [ -z "$PREV_TAG" ]; then
    echo "ERROR: No previous deployment to roll back to"
    exit 1
  fi
  IMAGE_TAG="$PREV_TAG"
  log "Rollback: deploying tag $IMAGE_TAG"
fi

log "[1/6] Repository updated (git pull completed by GitHub Actions)"

if [ -n "${GHCR_TOKEN:-}" ]; then
  echo "$GHCR_TOKEN" | docker login ghcr.io -u "${GHCR_USER:-github}" --password-stdin
fi

log "[2/6] Pulling Docker images (tag: $IMAGE_TAG)"
docker pull "${IMAGE_REGISTRY}:${IMAGE_TAG}"
docker pull "${IMAGE_REGISTRY}:${IMAGE_TAG}-migrate"

if [ "$INACTIVE" = "blue" ]; then
  export BLUE_IMAGE_TAG="$IMAGE_TAG"
  export GREEN_IMAGE_TAG=$(echo "$STATE_JSON" | node -e "const s=JSON.parse(require('fs').readFileSync(0,'utf8')); process.stdout.write(s.green?.tag||'latest')")
else
  export GREEN_IMAGE_TAG="$IMAGE_TAG"
  export BLUE_IMAGE_TAG=$(echo "$STATE_JSON" | node -e "const s=JSON.parse(require('fs').readFileSync(0,'utf8')); process.stdout.write(s.blue?.tag||'latest')")
fi

log "[3/6] Recreating container on inactive slot: app-${INACTIVE}"
docker compose --profile app up -d "app-${INACTIVE}" --pull always --force-recreate --no-deps

log "[4/6] Waiting for health check (app-${INACTIVE})"
for i in $(seq 1 60); do
  STATUS=$(docker inspect --format='{{.State.Health.Status}}' "kam-app-${INACTIVE}" 2>/dev/null || echo "starting")
  if [ "$STATUS" = "healthy" ]; then
    log "Health check passed"
    break
  fi
  if [ "$i" -eq 60 ]; then
    echo "ERROR: app-${INACTIVE} failed health check"
    docker logs "kam-app-${INACTIVE}" --tail 80
    exit 1
  fi
  sleep 5
done

log "[5/6] Running database migrations"
docker run --rm \
  --env-file .env.production \
  --network korea-auto-market_kam \
  "${IMAGE_REGISTRY}:${IMAGE_TAG}-migrate"

log "[6/6] Switching traffic (zero-downtime) and stopping app-${ACTIVE}"
echo "server app-${INACTIVE}:3000;" > "$UPSTREAM_FILE"
docker compose exec -T nginx nginx -s reload
docker compose stop "app-${ACTIVE}"

PREV_ACTIVE_TAG=$(echo "$STATE_JSON" | node -e "const s=JSON.parse(require('fs').readFileSync(0,'utf8')); process.stdout.write(s[s.active]?.tag||'')")

node -e "
const fs=require('fs');
const state=JSON.parse(fs.readFileSync('${STATE_FILE}','utf8'));
state.active='${INACTIVE}';
state['${INACTIVE}']={tag:'${IMAGE_TAG}'};
state.previous={slot:'${ACTIVE}',tag:'${PREV_ACTIVE_TAG}'};
fs.writeFileSync('${STATE_FILE}', JSON.stringify(state,null,2));
"

log "Deploy complete — active: app-${INACTIVE} (${IMAGE_TAG})"
