# Korea Auto Market — Architecture

## Overview

Telegram Mini App marketplace for used cars in South Korea. Mobile-first, self-hosted on Vultr VPS.

```
┌─────────────────────────────────────────────────────────┐
│                   Telegram Mini App                     │
│              (Telegram WebApp SDK / initData)           │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                    Nginx (TLS / proxy)                  │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│    Next.js 15 (Docker / standalone) via Compose       │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │   Pages     │  │  API Routes  │  │  Providers    │  │
│  └──────┬──────┘  └──────┬───────┘  └───────────────┘  │
│         │                │                              │
│  ┌──────▼────────────────▼──────────────────────────┐   │
│  │              Services Layer                      │   │
│  │   users · cars · favorites · admin               │   │
│  └──────┬─────────────────────┬────────────────────┘   │
└─────────┼─────────────────────┼────────────────────────┘
          │                     │
   ┌──────▼──────┐       ┌──────▼──────┐
   │ PostgreSQL  │       │ Cloudflare  │
   │ Vultr VPS   │       │     R2      │
   │ + Drizzle   │       │  (images)   │
   └─────────────┘       └─────────────┘
```

## Layer Responsibilities

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **Config** | `src/config/` | Validated environment variables (Zod) |
| **Database** | `src/db/` | Drizzle schema, `pg` pool, relations |
| **Types** | `src/types/` | Domain TypeScript types (from Drizzle) |
| **Schemas** | `src/schemas/` | Request/response validation (Zod) |
| **Lib** | `src/lib/` | Clients & utilities (R2, Telegram, auth) |
| **Services** | `src/services/` | Database operations via Drizzle |
| **Stores** | `src/stores/` | Client state (Zustand) |
| **Hooks** | `src/hooks/` | React hooks (TanStack Query wrappers) |
| **Providers** | `src/providers/` | React context providers |
| **Components** | `src/components/` | UI components (Shadcn + domain) |
| **App** | `src/app/` | Routes, layouts, API handlers |
| **Deploy** | `deploy/` | Docker CI/CD, Nginx, Certbot configs |

## Authentication Flow

1. Telegram Mini App provides `initData` via WebApp SDK
2. Client sends `initData` to `POST /api/auth/telegram`
3. Server validates HMAC signature with bot token
4. User upserted in `users` table via Drizzle (telegramId as unique key)
5. Session cookie set (`kam_session`) with user UUID
6. Protected API routes read session via `getCurrentUser()`

**Never:** email, password, or OAuth login.

## Data Model

| Table | Purpose |
|-------|---------|
| `users` | Telegram identity (telegramId, username, profile) |
| `cars` | Vehicle listings (soft delete, indexed for search) |
| `car_images` | Image URLs pointing to R2 (not stored in DB) |
| `favorites` | User ↔ car many-to-many |

Schema: `src/db/schema.ts` · Migrations: `drizzle/migrations/`

## Image Upload Flow

1. Client uploads images via `POST /api/upload` (multipart)
2. Server validates, compresses to WebP, uploads to R2
3. Client includes public URLs when creating listing

## Folder Structure

```
src/
├── app/
│   ├── api/                    # REST API routes
│   ├── (main)/                 # Public app pages
│   └── (admin)/                # Admin dashboard
├── components/
├── config/
├── db/
│   ├── schema.ts               # Drizzle table definitions
│   └── index.ts                # pg Pool + Drizzle client
├── services/
deploy/
├── ci/                         # deploy.sh (GitHub Actions only)
├── nginx/                      # Nginx + upstream configs
└── postgres/                   # DB bootstrap SQL
docker-compose.yml              # App + Nginx + Certbot
.github/workflows/              # CI/CD pipelines
drizzle/migrations/             # Versioned SQL migrations
database/                       # Canonical SQL reference
```

## Environment Variables

See `.env.example` and `.env.production.example`.

| Variable | Scope | Service |
|----------|-------|---------|
| `NEXT_PUBLIC_APP_URL` | Client | Public app URL |
| `DATABASE_URL` | Server | PostgreSQL on Vultr |
| `TELEGRAM_BOT_TOKEN` | Server | Telegram auth |
| `SESSION_SECRET` | Server | Session signing (required in prod) |
| `R2_*` | Server | Cloudflare R2 |

## Database Commands

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate migration from schema changes |
| `npm run db:migrate` | Apply migrations to PostgreSQL |
| `npm run db:push` | Push schema directly (dev only) |
| `npm run db:studio` | Open Drizzle Studio |

## Deployment

- **Platform:** Vultr VPS (Ubuntu)
- **Containers:** Docker + Docker Compose
- **CI/CD:** GitHub Actions (push to `main`)
- **Reverse proxy:** Nginx + Let's Encrypt
- **Database:** PostgreSQL (Vultr VPS or Managed)
- **Storage:** Cloudflare R2

See [DEPLOYMENT.md](DEPLOYMENT.md) for full setup guide. **Never deploy manually.**

## Development Phases

See [ROADMAP.md](ROADMAP.md).
