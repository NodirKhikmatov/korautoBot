# Korea Auto Market

Telegram Mini App marketplace for buying and selling used cars in South Korea.

## Status

**Foundation complete** — Neon PostgreSQL + Drizzle ORM, API routes, services, and R2 storage are in place. UI pages are Phase 1 (see [ROADMAP](docs/ROADMAP.md)).

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, TypeScript, TailwindCSS, Shadcn UI |
| State | Zustand, TanStack Query |
| Database | Neon PostgreSQL |
| ORM | Drizzle |
| Storage | Cloudflare R2 |
| Auth | Telegram Mini App SDK |
| Validation | Zod |
| Deployment | Vercel |

## Getting Started

```bash
npm install
cp .env.example .env.local   # fill in credentials
npm run db:push              # apply schema to Neon
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |
| `npm run format` | Prettier format |
| `npm run typecheck` | TypeScript check |
| `npm run db:generate` | Generate Drizzle migration |
| `npm run db:migrate` | Run migrations on Neon |
| `npm run db:push` | Push schema to Neon (dev) |
| `npm run db:studio` | Drizzle Studio |

## Documentation

- [Project Overview](docs/PROJECT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Roadmap](docs/ROADMAP.md)

## Project Structure

```
src/
├── app/api/          # REST API (auth, cars, favorites, upload)
├── db/               # Drizzle schema + Neon client
├── components/ui/    # Shadcn UI primitives
├── config/           # Environment validation
├── lib/              # R2, Telegram, auth
├── services/         # Database service layer (Drizzle)
├── schemas/          # Zod validation
├── stores/           # Zustand stores
├── providers/        # React providers
├── hooks/            # Custom hooks
└── types/            # TypeScript types
drizzle/migrations/   # SQL migrations
```

## License

Private
