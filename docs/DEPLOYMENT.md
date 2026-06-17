# Deployment — Vultr VPS (Docker + GitHub Actions)

All application deployments are **automatic via CI/CD**. Never deploy manually.

## Stack

| Component | Technology |
|-----------|------------|
| Hosting | Vultr VPS |
| Containerization | Docker |
| Orchestration | Docker Compose |
| CI/CD | GitHub Actions |
| Reverse proxy | Nginx (container) |
| SSL | Let's Encrypt (Certbot) |
| Database | PostgreSQL on Vultr |
| Storage | Cloudflare R2 |

## Architecture

```
GitHub (push main)
       │
       ▼
GitHub Actions ──build──► GHCR (container images)
       │
       └── SSH deploy ──► Vultr VPS
                              │
                    ┌─────────┴─────────┐
                    │  Docker Compose   │
                    │  nginx + certbot  │
                    │  app-blue         │  blue-green
                    │  app-green        │  zero downtime
                    └─────────┬─────────┘
                              │
              PostgreSQL (Vultr) + Cloudflare R2
```

## Zero-downtime deploy

Blue-green switching:

1. New image starts on the **inactive** slot (`app-blue` or `app-green`)
2. Health check passes (`/api/health`)
3. Database migrations run (migrate image)
4. Nginx upstream switches to the new slot
5. Previous slot stops

State tracked in `deploy/ci/.deploy-state.json` on the VPS (not in git).

## One-time VPS setup

### 1. Bootstrap server

```bash
sudo bash deploy/setup-vps-docker.sh
```

### 2. Clone and configure env on VPS

```bash
git clone <repo> /var/www/korea-auto-market
cd /var/www/korea-auto-market
cp .env.production.example .env.production
# Edit .env.production — all secrets live on VPS only
```

### 3. Bootstrap Docker stack + SSL

```bash
export APP_DOMAIN=your.domain.com
export CERTBOT_EMAIL=you@your.domain.com
export IMAGE_REGISTRY=ghcr.io/<owner>/korea-auto-market
bash deploy/ci/bootstrap.sh
```

### 4. GHCR pull access on VPS

Create a GitHub PAT with `read:packages` and store as GitHub secret `GHCR_READ_TOKEN` (used during deploy SSH).

Alternatively, log in once on the VPS:

```bash
echo $TOKEN | docker login ghcr.io -u YOUR_GITHUB_USER --password-stdin
```

## GitHub configuration

### Secrets (repository → Settings → Secrets → Actions)

| Secret | Description |
|--------|-------------|
| `VPS_HOST` | VPS IP or hostname |
| `VPS_USER` | SSH user (e.g. `deploy`) |
| `VPS_SSH_KEY` | Private SSH key |
| `VPS_DEPLOY_PATH` | Optional, default `/var/www/korea-auto-market` |
| `GHCR_READ_TOKEN` | PAT with `read:packages` for pulling images on VPS |

### Environment

Create a **production** environment in GitHub (optional protection rules).

### Package permissions

Ensure GitHub Actions can push to GHCR (`packages: write` in workflow — already configured).

Make the package public **or** use `GHCR_READ_TOKEN` on the VPS.

## Automatic deployment

Every push to `main`:

1. **CI** — typecheck, lint, Docker build verify
2. **Build** — push `ghcr.io/<repo>:<sha>` and `:<sha>-migrate`
3. **Deploy** — SSH to VPS, `git pull`, `deploy/ci/deploy.sh`

## Rollback

GitHub → Actions → **Deploy** → **Run workflow** → enable **Rollback to previous deployment**.

Uses the previous image tag from `.deploy-state.json`. No manual steps on the VPS.

## Health checks

| Check | Endpoint / probe |
|-------|------------------|
| Docker | `GET /api/health` inside container |
| Compose | `healthcheck` on `app-blue` / `app-green` |
| Deploy script | waits until `healthy` before traffic switch |

Health response:

```json
{ "status": "ok", "database": "ok", "timestamp": 1234567890 }
```

Returns `503` if database is unreachable.

## Environment variables

**All production secrets live on the VPS** in `.env.production` (never committed).

See `.env.production.example`. Docker Compose loads this file for app containers.

## Useful VPS commands

```bash
cd /var/www/korea-auto-market
docker compose ps
docker compose logs -f app-blue
docker compose logs -f nginx
docker compose exec nginx nginx -s reload
```

## Database migrations

Migrations run automatically during deploy (migrate container) **before** traffic switches.

Manual migration (emergency only):

```bash
docker run --rm --env-file .env.production --network korea-auto-market_kam \
  ghcr.io/<owner>/korea-auto-market:<tag>-migrate
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Deploy fails at `docker pull` | Check `GHCR_READ_TOKEN`, package visibility |
| Nginx 502 | `docker compose ps` — wait for healthy app slot |
| SSL errors | `docker compose logs certbot`, re-run bootstrap cert step |
| Health check fails | `docker logs kam-app-blue` — check `DATABASE_URL` in `.env.production` |
| Rollback unavailable | No previous deploy in `.deploy-state.json` |

## Local Docker build

```bash
npm run docker:build
```
