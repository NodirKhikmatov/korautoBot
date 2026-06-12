-- =============================================================================
-- Korea Auto Market — PostgreSQL Schema (Neon)
-- Tables: users, cars, car_images, favorites
-- Optimized for: 100k+ users, fast search, low cost
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------

CREATE TYPE fuel_type AS ENUM (
  'gasoline',
  'diesel',
  'electric',
  'hybrid',
  'lpg'
);

CREATE TYPE transmission AS ENUM (
  'automatic',
  'manual'
);

-- -----------------------------------------------------------------------------
-- users — Telegram identity (single source of truth)
-- -----------------------------------------------------------------------------

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id   BIGINT NOT NULL,
  username      TEXT,
  first_name    TEXT,
  last_name     TEXT,
  photo_url     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ,

  CONSTRAINT users_telegram_id_unique UNIQUE (telegram_id),
  CONSTRAINT users_telegram_id_positive CHECK (telegram_id > 0)
);

CREATE INDEX idx_users_telegram_id ON users (telegram_id);
CREATE INDEX idx_users_active ON users (id) WHERE deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- cars — vehicle listings (soft delete)
-- -----------------------------------------------------------------------------

CREATE TABLE cars (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  brand         TEXT NOT NULL,
  model         TEXT NOT NULL,
  year          INTEGER NOT NULL,
  price         BIGINT NOT NULL,
  mileage       INTEGER NOT NULL,
  fuel_type     fuel_type NOT NULL,
  transmission  transmission NOT NULL,
  description   TEXT,
  location      TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ,
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector(
      'simple',
      coalesce(title, '') || ' ' ||
      coalesce(brand, '') || ' ' ||
      coalesce(model, '') || ' ' ||
      coalesce(location, '')
    )
  ) STORED,

  CONSTRAINT cars_year_range CHECK (year >= 1990 AND year <= 2100),
  CONSTRAINT cars_price_positive CHECK (price > 0),
  CONSTRAINT cars_mileage_non_negative CHECK (mileage >= 0),
  CONSTRAINT cars_title_not_empty CHECK (length(trim(title)) > 0),
  CONSTRAINT cars_brand_not_empty CHECK (length(trim(brand)) > 0),
  CONSTRAINT cars_model_not_empty CHECK (length(trim(model)) > 0)
);

CREATE INDEX idx_cars_user_id ON cars (user_id);
CREATE INDEX idx_cars_brand ON cars (brand);
CREATE INDEX idx_cars_price ON cars (price);
CREATE INDEX idx_cars_year ON cars (year);
CREATE INDEX idx_cars_fuel_type ON cars (fuel_type);
CREATE INDEX idx_cars_transmission ON cars (transmission);
CREATE INDEX idx_cars_location ON cars (location);
CREATE INDEX idx_cars_created_at ON cars (created_at DESC);

-- Partial indexes — only active, non-deleted listings (smaller, faster)
CREATE INDEX idx_cars_active_list ON cars (created_at DESC)
  WHERE is_active = TRUE AND deleted_at IS NULL;

CREATE INDEX idx_cars_filter_combo ON cars (brand, fuel_type, transmission, year, price)
  WHERE is_active = TRUE AND deleted_at IS NULL;

CREATE INDEX idx_cars_price_year ON cars (price, year)
  WHERE is_active = TRUE AND deleted_at IS NULL;

-- Full-text search (GIN)
CREATE INDEX idx_cars_search_vector ON cars USING GIN (search_vector);

-- Trigram index for partial / fuzzy text match (low-cost fallback)
CREATE INDEX idx_cars_title_trgm ON cars USING GIN (title gin_trgm_ops);
CREATE INDEX idx_cars_brand_trgm ON cars USING GIN (brand gin_trgm_ops);

-- -----------------------------------------------------------------------------
-- car_images — R2 URLs only (never store binary in DB)
-- -----------------------------------------------------------------------------

CREATE TABLE car_images (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id         UUID NOT NULL REFERENCES cars (id) ON DELETE CASCADE,
  url            TEXT NOT NULL,
  thumbnail_url  TEXT NOT NULL,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT car_images_url_not_empty CHECK (length(trim(url)) > 0),
  CONSTRAINT car_images_thumbnail_url_not_empty CHECK (length(trim(thumbnail_url)) > 0),
  CONSTRAINT car_images_sort_order_non_negative CHECK (sort_order >= 0)
);

CREATE INDEX idx_car_images_car_id ON car_images (car_id);
CREATE INDEX idx_car_images_car_sort ON car_images (car_id, sort_order);

-- -----------------------------------------------------------------------------
-- favorites — user ↔ car (unique pair)
-- -----------------------------------------------------------------------------

CREATE TABLE favorites (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  car_id     UUID NOT NULL REFERENCES cars (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT favorites_user_car_unique UNIQUE (user_id, car_id)
);

CREATE INDEX idx_favorites_user_id ON favorites (user_id);
CREATE INDEX idx_favorites_car_id ON favorites (car_id);
CREATE INDEX idx_favorites_user_created ON favorites (user_id, created_at DESC);

-- -----------------------------------------------------------------------------
-- updated_at trigger
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER cars_set_updated_at
  BEFORE UPDATE ON cars
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
