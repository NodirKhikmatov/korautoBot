# Korea Auto Market — Architecture

## Overview

Telegram Mini App marketplace for used cars in South Korea. Mobile-first, low-cost, scalable to 100k+ users.

```
┌─────────────────────────────────────────────────────────┐
│                   Telegram Mini App                     │
│              (Telegram WebApp SDK / initData)           │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│              Next.js 15 App Router (Vercel)             │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │   Pages     │  │  API Routes  │  │  Providers    │  │
│  │  (Phase 1)  │  │  /api/*      │  │  Query/Zustand│  │
│  └──────┬──────┘  └──────┬───────┘  └───────────────┘  │
│         │                │                              │
│  ┌──────▼────────────────▼──────────────────────────┐   │
│  │              Services Layer                      │   │
│  │   users · cars · favorites                       │   │
│  └──────┬─────────────────────┬────────────────────┘   │
└─────────┼─────────────────────┼────────────────────────┘
          │                     │
   ┌──────▼──────┐       ┌──────▼──────┐
   │    Neon     │       │ Cloudflare  │
   │ PostgreSQL  │       │     R2      │
   │ + Drizzle   │       │  (images)   │
   └─────────────┘       └─────────────┘
```

## Layer Responsibilities

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **Config** | `src/config/` | Validated environment variables (Zod) |
| **Database** | `src/db/` | Drizzle schema, Neon client, relations |
| **Types** | `src/types/` | Domain TypeScript types (from Drizzle) |
| **Schemas** | `src/schemas/` | Request/response validation (Zod) |
| **Lib** | `src/lib/` | Clients & utilities (R2, Telegram, auth) |
| **Services** | `src/services/` | Database operations via Drizzle |
| **Stores** | `src/stores/` | Client state (Zustand) |
| **Hooks** | `src/hooks/` | React hooks (TanStack Query wrappers) |
| **Providers** | `src/providers/` | React context providers |
| **Components** | `src/components/` | UI components (Shadcn + domain) |
| **App** | `src/app/` | Routes, layouts, API handlers |

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

1. Client requests presigned URL: `POST /api/upload`
2. Server generates R2 key + presigned PUT URL
3. Client uploads directly to R2
4. Client includes public URL when creating listing

## Folder Structure

```
src/
├── app/
│   ├── api/                    # REST API routes
│   └── (main)/                 # Page routes — Phase 1 (placeholders)
├── components/
│   ├── ui/                     # Shadcn primitives
│   ├── cars/                   # Car domain components
│   ├── layout/                 # Header, footer, nav
│   └── telegram/               # Telegram SDK integration
├── config/
│   └── env.ts                  # Environment validation
├── db/
│   ├── schema.ts               # Drizzle table definitions
│   └── index.ts                # Neon + Drizzle client
├── hooks/
├── lib/
│   ├── auth/                   # Session management
│   ├── r2/                     # Cloudflare R2 client
│   └── telegram/               # initData validation
├── providers/
├── schemas/
├── services/
├── stores/
└── types/
drizzle/
└── migrations/                 # Drizzle SQL migrations
```

## API Routes

| Route | Methods | Auth | Description |
|-------|---------|------|-------------|
| `/api/auth/telegram` | POST | — | Validate initData, create session |
| `/api/auth/logout` | POST | — | Clear session |
| `/api/cars` | GET, POST | POST | List / create listings |
| `/api/cars/[id]` | GET, DELETE | DELETE | Get / soft-delete listing |
| `/api/favorites` | GET, POST, DELETE | All | Manage favorites |
| `/api/upload` | POST | Yes | R2 presigned upload URL |

## Environment Variables

See `.env.example`. Validated at runtime via `src/config/env.ts`.

| Variable | Scope | Service |
|----------|-------|---------|
| `NEXT_PUBLIC_APP_URL` | Client | App URL |
| `DATABASE_URL` | Server | Neon PostgreSQL |
| `TELEGRAM_BOT_TOKEN` | Server | Telegram auth |
| `R2_*` | Server | Cloudflare R2 |

## Database Commands

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate migration from schema changes |
| `npm run db:migrate` | Apply migrations to Neon |
| `npm run db:push` | Push schema directly (dev) |
| `npm run db:studio` | Open Drizzle Studio |

## Deployment

- **Platform:** Vercel
- **Database:** Neon (serverless PostgreSQL)
- **Storage:** Cloudflare R2
- **Target budget:** under $20/month MVP

## Development Phases

See [ROADMAP.md](ROADMAP.md).
