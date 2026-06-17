# sslip.io Setup (no domain purchase)

Free HTTPS subdomain for your Vultr VPS IP.

| VPS IP | sslip.io domain |
|--------|-----------------|
| `158.247.234.119` | `158-247-234-119.sslip.io` |

Works with Let's Encrypt and Telegram Mini App.

## Vultr firewall (panel — one time)

In [Vultr](https://my.vultr.com) → your server → **Settings → Firewall**:

- Allow inbound **TCP 22** (SSH)
- Allow inbound **TCP 80** (HTTP — Let's Encrypt)
- Allow inbound **TCP 443** (HTTPS)

If you skip this, Certbot fails with **Connection refused**.

## VPS setup (one time)

```bash
# 1. Clone
cd /var/www
git clone https://github.com/NodirKhikmatov/korautoBot.git korea-auto-market
cd korea-auto-market

# 2. Docker
bash deploy/setup-vps-docker.sh

# 3. Environment
cp .env.production.example .env.production
nano .env.production
# Fill DATABASE_URL, TELEGRAM_BOT_TOKEN, SESSION_SECRET, R2_*, etc.

# 4. sslip.io + SSL
export VPS_IP=158.247.234.119
export CERTBOT_EMAIL=you@gmail.com
bash deploy/ci/bootstrap-sslip.sh
```

## GitHub

**Variable** (Settings → Actions → Variables):

```
NEXT_PUBLIC_APP_URL=https://158-247-234-119.sslip.io
```

**Secrets** (already set): `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `GHCR_READ_TOKEN`

## Deploy

```bash
git push origin main
```

## Verify

```bash
curl https://158-247-234-119.sslip.io/api/health
```

## Telegram

@BotFather → your bot → **Edit Bot** → **Menu Button** / **Web App**:

```
https://158-247-234-119.sslip.io
```
