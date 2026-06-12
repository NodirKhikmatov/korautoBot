#!/usr/bin/env bash
# Zero-downtime blue-green deploy — invoked only by GitHub Actions.
set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
cd "$DEPLOY_DIR"

STATE_FILE="deploy/ci/.deploy-state.json"
UPSTREAM_FILE="deploy/nginx/upstream/active.conf"
IMAGE_TAG="${IMAGE_TAG:?IMAGE_TAG is required}"
IMAGE_REGISTRY="${IMAGE_REGISTRY:?IMAGE_REGISTRY is required}"
ROLLBACK="${ROLLBACK:-false}"

if [ ! -f .env.production ]; then
  echo "ERROR: .env.production not found on VPS"
  exit 1
fi

# shellcheck source=/dev/null
set -a && source .env.production && set +a

mkdir -p deploy/ci deploy/nginx/upstream

read_state() {
  if [ -f "$STATE_FILE" ]; then
    cat "$STATE_FILE"
  else
    echo '{"active":"blue","blue":{"tag":""},"green":{"tag":""},"previous":null}'
  fi
}

write_state() {
  echo "$1" > "$STATE_FILE"
}

STATE_JSON=$(read_state)
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
  echo "==> Rollback to tag: $IMAGE_TAG"
fi

if [ -n "${GHCR_TOKEN:-}" ]; then
  echo "$GHCR_TOKEN" | docker login ghcr.io -u "${GHCR_USER:-github}" --password-stdin
fi

echo "==> Pulling images for tag: $IMAGE_TAG"
docker pull "${IMAGE_REGISTRY}:${IMAGE_TAG}"
docker pull "${IMAGE_REGISTRY}:${IMAGE_TAG}-migrate"

if [ "$INACTIVE" = "blue" ]; then
  export BLUE_IMAGE_TAG="$IMAGE_TAG"
  export GREEN_IMAGE_TAG=$(echo "$STATE_JSON" | node -e "const s=JSON.parse(require('fs').readFileSync(0,'utf8')); process.stdout.write(s.green?.tag||'latest')")
else
  export GREEN_IMAGE_TAG="$IMAGE_TAG"
  export BLUE_IMAGE_TAG=$(echo "$STATE_JSON" | node -e "const s=JSON.parse(require('fs').readFileSync(0,'utf8')); process.stdout.write(s.blue?.tag||'latest')")
fi

echo "==> Starting inactive slot: $INACTIVE"
docker compose up -d "app-${INACTIVE}" --pull always --no-deps

echo "==> Waiting for app-${INACTIVE} to become healthy..."
for i in $(seq 1 60); do
  STATUS=$(docker inspect --format='{{.State.Health.Status}}' "kam-app-${INACTIVE}" 2>/dev/null || echo "starting")
  if [ "$STATUS" = "healthy" ]; then
    echo "Health check passed."
    break
  fi
  if [ "$i" -eq 60 ]; then
    echo "ERROR: app-${INACTIVE} failed health check"
    docker logs "kam-app-${INACTIVE}" --tail 50
    exit 1
  fi
  sleep 5
done

echo "==> Running database migrations"
docker run --rm \
  --env-file .env.production \
  --network korea-auto-market_kam \
  "${IMAGE_REGISTRY}:${IMAGE_TAG}-migrate"

echo "==> Switching Nginx upstream to app-${INACTIVE}"
echo "server app-${INACTIVE}:3000;" > "$UPSTREAM_FILE"
docker compose exec -T nginx nginx -s reload

echo "==> Stopping previous active slot: $ACTIVE"
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

echo "==> Deploy complete. Active slot: $INACTIVE ($IMAGE_TAG)"
