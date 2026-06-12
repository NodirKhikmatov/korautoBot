# Database Architecture

Neon PostgreSQL + Drizzle ORM. Optimized for **100k+ users**, **fast search**, **low cost**.

## Entity Relationship

```
users (1) ──< cars (1) ──< car_images
  │              │
  │              │
  └──< favorites >──┘
```

| Table | Rows (est. at scale) | Purpose |
|-------|----------------------|---------|
| `users` | 100k+ | Telegram identity |
| `cars` | 500k+ | Listings (soft delete) |
| `car_images` | 2M+ | R2 URLs only |
| `favorites` | 1M+ | User ↔ car pairs |

## Files

| Path | Purpose |
|------|---------|
| `database/schema.sql` | Canonical SQL schema (fresh install reference) |
| `database/rls.sql` | Row Level Security policies |
| `src/db/schema.ts` | Drizzle schema (source of truth for app) |
| `drizzle/migrations/` | Versioned migrations |

## Indexes Strategy

### Partial indexes (low cost)

Only index **active, non-deleted** listings — smaller index size, faster scans:

- `idx_cars_active_list` — browse feed (`created_at DESC`)
- `idx_cars_filter_combo` — brand + fuel + transmission + year + price
- `idx_cars_price_year` — price/year range filters
- `idx_users_active` — active users only

### Search indexes

| Index | Type | Use case |
|-------|------|----------|
| `idx_cars_search_vector` | GIN (tsvector) | Full-text search on title, brand, model, location |
| `idx_cars_title_trgm` | GIN (pg_trgm) | Partial / fuzzy title match |
| `idx_cars_brand_trgm` | GIN (pg_trgm) | Partial brand match |

`search_vector` is a **generated column** — zero application maintenance.

### Foreign keys

All child tables use `ON DELETE CASCADE`:

- `cars.user_id` → `users.id`
- `car_images.car_id` → `cars.id`
- `favorites.user_id` → `users.id`
- `favorites.car_id` → `cars.id`

## Row Level Security

RLS is enabled on all tables. Session context is set per transaction:

```sql
SET LOCAL app.bypass_rls = 'true';  -- server API (auth at route layer)
SET LOCAL app.user_id = '<uuid>';   -- user-scoped operations
```

Application helper: `src/db/context.ts`

| Table | Public read | Write |
|-------|-------------|-------|
| `users` | Active profiles | Server upsert (Telegram auth) |
| `cars` | Active listings | Owner or server |
| `car_images` | Images of visible cars | Owner or server |
| `favorites` | Own favorites only | Own favorites only |

**Note:** Neon owner role bypasses RLS by default. Policies apply when using a limited runtime role or `FORCE ROW LEVEL SECURITY`.

## Constraints

- `users.telegram_id` — unique, positive
- `cars` — year 1990–2100, price > 0, mileage ≥ 0
- `car_images` — non-empty URL, sort_order ≥ 0
- `favorites` — unique (user_id, car_id)

## Migrations

```bash
# Fresh Neon project (no schema yet)
npm run db:migrate

# Dev: push Drizzle schema directly (skips migration journal)
npm run db:push

# Schema exists but migrate says "fuel_type already exists":
npm run db:fix             # sync journal (marks 0000 + 0001 as applied)
npm run db:migrate

# Optional if 0001 enhancements not yet on DB:
npm run db:apply-0001      # idempotent — skips existing objects

# Do NOT run db:generate on an existing DB without db:fix first

# Generate new migration after schema change
npm run db:generate
```

Migration history:

1. `0000_initial` — tables, FKs, base indexes
2. `0001_architecture_enhancements` — checks, FTS, partial indexes, triggers, RLS

## Query Patterns

| Operation | Index used |
|-----------|------------|
| Latest listings | `idx_cars_active_list` |
| Filter by brand/price/year | `idx_cars_filter_combo` |
| Text search | `idx_cars_search_vector` + trigram fallback |
| User's cars | `idx_cars_user_id` |
| User favorites | `idx_favorites_user_created` |
| Car images | `idx_car_images_car_sort` |

## Cost Optimization

- Partial indexes reduce storage vs full-table indexes
- Generated `search_vector` avoids trigger maintenance
- UUID PKs — no sequence contention at scale
- Soft deletes preserve referential integrity without orphan rows
- Images in R2 only — no TOAST/blob storage in PostgreSQL
