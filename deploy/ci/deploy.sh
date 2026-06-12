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

if [ ! -f "$UPSTREAM_FILE" ]; then
  echo "server 127.0.0.1:65535 down;" > "$UPSTREAM_FILE"
fi

# git reset --hard must not wipe runtime nginx files (they are gitignored on VPS).
DOMAIN="${APP_DOMAIN:-}"
if [ -z "$DOMAIN" ] && [ -n "${NEXT_PUBLIC_APP_URL:-}" ]; then
  DOMAIN="${NEXT_PUBLIC_APP_URL#https://}"
  DOMAIN="${DOMAIN#http://}"
  DOMAIN="${DOMAIN%%/*}"
fi
if [ -n "$DOMAIN" ] && [ -f deploy/nginx/docker/default.conf ]; then
  sed "s/YOUR_DOMAIN/${DOMAIN}/g" deploy/nginx/docker/default.conf \
    > deploy/nginx/docker/default.conf.active
fi

if [ ! -f "$STATE_FILE" ]; then
  echo '{"active":"blue","blue":{"tag":""},"green":{"tag":""},"previous":null}' > "$STATE_FILE"
fi

state_get() {
  python3 - "$STATE_FILE" "$1" <<'PY'
import json
import sys

path, field = sys.argv[1], sys.argv[2]
with open(path, encoding="utf-8") as f:
    state = json.load(f)

if field == "active":
    print(state.get("active") or "blue")
elif field == "previous.tag":
    prev = state.get("previous") or {}
    print(prev.get("tag") or "")
elif field == "blue.tag":
    print((state.get("blue") or {}).get("tag") or "latest")
elif field == "green.tag":
    print((state.get("green") or {}).get("tag") or "latest")
elif field == "active.tag":
    slot = state.get("active") or "blue"
    print((state.get(slot) or {}).get("tag") or "")
else:
    raise SystemExit(f"unknown state field: {field}")
PY
}

state_write() {
  python3 - "$STATE_FILE" "$1" "$2" "$3" "$4" <<'PY'
import json
import sys

path, active, inactive, image_tag, prev_active_tag = sys.argv[1:6]
with open(path, encoding="utf-8") as f:
    state = json.load(f)

state["active"] = inactive
state[inactive] = {"tag": image_tag}
state["previous"] = {"slot": active, "tag": prev_active_tag}

with open(path, "w", encoding="utf-8") as f:
    json.dump(state, f, indent=2)
    f.write("\n")
PY
}

ACTIVE=$(state_get active)

if [ "$ACTIVE" = "blue" ]; then
  INACTIVE="green"
else
  INACTIVE="blue"
fi

if [ "$ROLLBACK" = "true" ]; then
  PREV_TAG=$(state_get previous.tag)
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
  export GREEN_IMAGE_TAG=$(state_get green.tag)
else
  export GREEN_IMAGE_TAG="$IMAGE_TAG"
  export BLUE_IMAGE_TAG=$(state_get blue.tag)
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
log "Nginx upstream: app-${INACTIVE}:3000"
docker compose up -d nginx --force-recreate --no-deps
docker compose stop "app-${ACTIVE}"

PREV_ACTIVE_TAG=$(state_get active.tag)
state_write "$ACTIVE" "$INACTIVE" "$IMAGE_TAG" "$PREV_ACTIVE_TAG"

log "Deploy complete — active: app-${INACTIVE} (${IMAGE_TAG})"
