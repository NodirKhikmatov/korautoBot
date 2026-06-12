# Environment Variables

Production secrets live **only on the Vultr VPS** in `.env.production`. Never commit this file.

## Setup on VPS

```bash
cd /var/www/korea-auto-market
cp .env.production.example .env.production
nano .env.production
```

Docker Compose loads `.env.production` for `app-blue` and `app-green`.

## Required variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Public HTTPS URL of the app | `https://app.example.com` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@127.0.0.1:5432/korea_auto_market` |
| `TELEGRAM_BOT_TOKEN` | Bot token from @BotFather | |
| `SESSION_SECRET` | Min 32 chars — session signing | random 64-char string |
| `R2_ACCOUNT_ID` | Cloudflare R2 account ID | |
| `R2_ACCESS_KEY_ID` | R2 API key | |
| `R2_SECRET_ACCESS_KEY` | R2 secret | |
| `R2_BUCKET_NAME` | R2 bucket name | |
| `R2_PUBLIC_URL` | Public URL for images | `https://bucket.r2.dev` |

## Optional variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ADMIN_TELEGRAM_IDS` | — | Comma-separated Telegram user IDs for admin |
| `DATABASE_POOL_MAX` | `10` | `pg` pool size per container |
| `DATABASE_SSL` | auto | Set `true` if DB requires SSL |
| `IMAGE_REGISTRY` | set by deploy | GHCR image path (for manual `docker compose`) |
| `NODE_ENV` | `production` | Node environment |
| `PORT` | `3000` | App port inside container |
| `HOSTNAME` | `0.0.0.0` | Bind address |

## GitHub repository variables (not secrets)

Settings → Secrets and variables → Actions → Variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | Used at Docker build time for Next.js |

## GitHub Actions secrets

| Secret | Description |
|--------|-------------|
| `VPS_HOST` | Vultr server IP or domain |
| `VPS_USER` | SSH user (`root` on Ubuntu VPS) |
| `VPS_SSH_KEY` | SSH private key |
| `GHCR_READ_TOKEN` | GitHub PAT with `read:packages` |
| `VPS_DEPLOY_PATH` | Optional — default `/var/www/korea-auto-market` |

## Generate SESSION_SECRET

```bash
openssl rand -base64 48
```

## Validate locally (optional)

```bash
set -a && source .env.production && set +a
npm run db:migrate:prod
```
