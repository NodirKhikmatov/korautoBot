# Production Setup Guide

Complete guide for deploying Korea Auto Market on **Vultr VPS** with **Docker**, **GitHub Actions**, **Nginx**, and **Let's Encrypt**.

## Deployment flow

```
GitHub push (main)
    ↓
GitHub Actions — build Docker image
    ↓
Push image to GHCR (ghcr.io)
    ↓
SSH into Vultr VPS
    ↓
git pull latest code
    ↓
docker pull image + recreate container (inactive slot)
    ↓
health check → migrations
    ↓
Nginx upstream switch (zero downtime)
    ↓
stop old container
```

**Never deploy manually.** All deploys go through GitHub Actions.

## Step 1 — Vultr VPS

1. Create Ubuntu 22.04/24.04 server (2 vCPU, 4 GB RAM minimum)
2. Note the **IP address** → `VPS_HOST`
3. SSH user is usually `root` → `VPS_USER`

```bash
sudo bash deploy/setup-vps-docker.sh
```

## Step 2 — SSH key

On your Mac:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/korea_auto_deploy -C "deploy"
ssh-copy-id -i ~/.ssh/korea_auto_deploy.pub root@YOUR_VPS_IP
```

Private key → GitHub secret `VPS_SSH_KEY`

## Step 3 — Clone repository on VPS

```bash
git clone https://github.com/YOUR_USER/korAvtotelegram.git /var/www/korea-auto-market
cd /var/www/korea-auto-market
```

## Step 4 — Environment variables (VPS)

```bash
cp .env.production.example .env.production
nano .env.production
```

See [ENVIRONMENT.md](ENVIRONMENT.md) for all variables.

## Step 5 — PostgreSQL

On VPS or Vultr Managed PostgreSQL:

```bash
sudo -u postgres psql -f deploy/postgres/init-app-db.sql
```

Update `DATABASE_URL` in `.env.production`.

## Step 6 — SSL bootstrap

```bash
export APP_DOMAIN=your.domain.com
export CERTBOT_EMAIL=you@domain.com
export IMAGE_REGISTRY=ghcr.io/your-user/korAvtotelegram
bash deploy/ci/bootstrap.sh
```

Details: [SSL_SETUP.md](SSL_SETUP.md)

## Step 7 — GitHub configuration

### Secrets (Settings → Secrets → Actions)

| Secret | Value |
|--------|-------|
| `VPS_HOST` | Server IP |
| `VPS_USER` | `root` |
| `VPS_SSH_KEY` | Private SSH key |
| `GHCR_READ_TOKEN` | PAT with `read:packages` |
| `VPS_DEPLOY_PATH` | `/var/www/korea-auto-market` |

### Variables

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_APP_URL` | `https://your.domain.com` |

### Environment

Create **production** environment in GitHub (Settings → Environments).

### GHCR package access

After first build, make package public **or** use `GHCR_READ_TOKEN` on deploy.

## Step 8 — Deploy

Push to `main`:

```bash
git push origin main
```

Watch: GitHub → Actions → **Deploy**

## Rollback

GitHub → Actions → Deploy → **Run workflow** → enable **Rollback**

## Files reference

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage app + migrate images |
| `docker-compose.yml` | App, Nginx, Certbot stack |
| `.dockerignore` | Build exclusions |
| `.github/workflows/deploy.yml` | CI/CD pipeline |
| `.github/workflows/ci.yml` | PR checks |
| `deploy/ci/deploy.sh` | Zero-downtime deploy script |
| `deploy/nginx/docker/` | Nginx configs |
| `.env.production` | Secrets on VPS only |

## Verify

```bash
curl https://your.domain.com/api/health
```

Expected:

```json
{"status":"ok","database":"ok","timestamp":...}
```
