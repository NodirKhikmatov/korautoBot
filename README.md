# Korea Auto Market

Telegram Mini App marketplace for buying and selling used cars in South Korea.

## Status

Production-ready stack: PostgreSQL on Vultr VPS, Drizzle ORM, Cloudflare R2, Nginx, PM2.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, TypeScript, TailwindCSS, Shadcn UI |
| State | Zustand, TanStack Query |
| Database | PostgreSQL (Vultr VPS) |
| ORM | Drizzle |
| Storage | Cloudflare R2 |
| Auth | Telegram Mini App SDK |
| Validation | Zod |
| Deployment | Vultr VPS, Docker, GitHub Actions, Nginx |

## Getting Started (local)

```bash
npm install
cp .env.example .env.local   # fill in credentials
npm run db:migrate           # apply migrations to PostgreSQL
npm run dev
```

Requires a local PostgreSQL instance. See `deploy/postgres/init-app-db.sql` for database setup.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build (standalone) |
| `npm run start` | Production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run db:generate` | Generate Drizzle migration |
| `npm run db:migrate` | Run migrations |
| `npm run db:push` | Push schema (dev) |
| `npm run docker:build` | Build Docker image locally |
| `npm run db:migrate:prod` | Run migrations (production script) |

## Documentation

- [Project Overview](docs/PROJECT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Production Setup (start here)](docs/PRODUCTION_SETUP.md)
- [Environment Variables](docs/ENVIRONMENT.md)
- [SSL / Let's Encrypt](docs/SSL_SETUP.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Database](docs/DATABASE.md)
- [Roadmap](docs/ROADMAP.md)

## Project Structure

```
src/
├── app/api/          # REST API
├── db/               # Drizzle schema + pg client
├── services/         # Database service layer
├── lib/              # R2, Telegram, auth
deploy/
├── ci/               # CI/CD deploy scripts (GitHub Actions only)
├── nginx/            # Nginx + SSL configs
docker-compose.yml    # Production stack
.github/workflows/    # CI + deploy pipelines
drizzle/migrations/   # SQL migrations
database/             # Canonical SQL reference
```

## License

Private
