# SSL Setup — Let's Encrypt

SSL is handled by **Certbot** in Docker Compose, with **Nginx** terminating TLS.

## Prerequisites

- Domain A record pointing to Vultr VPS IP
- Ports `80` and `443` open (firewall + Vultr)
- Stack bootstrapped on VPS

## One-time bootstrap (on VPS)

```bash
cd /var/www/korea-auto-market

export APP_DOMAIN=app.example.com
export CERTBOT_EMAIL=you@example.com
export IMAGE_REGISTRY=ghcr.io/YOUR_GITHUB_USER/korAvtotelegram

bash deploy/ci/bootstrap.sh
```

What bootstrap does:

1. Starts Nginx with **HTTP-only** config (for ACME challenge)
2. Starts app slots and Certbot renewal loop
3. Requests Let's Encrypt certificate via webroot
4. Switches Nginx to **HTTPS** config
5. Restarts Nginx

## Manual certificate (if bootstrap failed)

Ensure HTTP works first:

```bash
docker compose up -d nginx certbot app-blue app-green
```

Request certificate:

```bash
docker compose run --rm --entrypoint certbot certbot certonly \
  --webroot -w /var/www/certbot \
  -d app.example.com \
  --email you@example.com \
  --agree-tos \
  --no-eff-email \
  --non-interactive
```

Enable HTTPS config:

```bash
sed -i "s/YOUR_DOMAIN/app.example.com/g" deploy/nginx/docker/default.conf
cp deploy/nginx/docker/default.conf deploy/nginx/docker/default.conf.active
docker compose restart nginx
```

## Auto-renewal

The `certbot` service renews certificates every 12 hours. No manual action needed.

Verify renewal timer:

```bash
docker compose logs certbot --tail 20
```

## Test SSL

```bash
curl -I https://app.example.com/api/health
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Certificate request fails | DNS not propagated — wait, check `dig app.example.com` |
| Nginx won't start (SSL) | Certs missing — run certonly step first |
| 502 after SSL | App not healthy — `docker compose ps` |
| Mixed content | Set `NEXT_PUBLIC_APP_URL` to `https://` |

## File reference

| File | Purpose |
|------|---------|
| `deploy/nginx/docker/default-http.conf` | HTTP-only (bootstrap) |
| `deploy/nginx/docker/default.conf` | HTTPS production |
| `deploy/nginx/docker/default.conf.active` | Active config (mounted into Nginx) |
| `deploy/nginx/upstream/active.conf` | Blue-green upstream target |
