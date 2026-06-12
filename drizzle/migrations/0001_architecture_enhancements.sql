-- Migration: indexes, constraints, full-text search, triggers, RLS
-- Safe to run on databases that already applied 0000_initial

CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint

-- CHECK constraints
ALTER TABLE "users" ADD CONSTRAINT "users_telegram_id_positive" CHECK (telegram_id > 0);--> statement-breakpoint
ALTER TABLE "cars" ADD CONSTRAINT "cars_year_range" CHECK (year >= 1990 AND year <= 2100);--> statement-breakpoint
ALTER TABLE "cars" ADD CONSTRAINT "cars_price_positive" CHECK (price > 0);--> statement-breakpoint
ALTER TABLE "cars" ADD CONSTRAINT "cars_mileage_non_negative" CHECK (mileage >= 0);--> statement-breakpoint
ALTER TABLE "cars" ADD CONSTRAINT "cars_title_not_empty" CHECK (length(trim(title)) > 0);--> statement-breakpoint
ALTER TABLE "cars" ADD CONSTRAINT "cars_brand_not_empty" CHECK (length(trim(brand)) > 0);--> statement-breakpoint
ALTER TABLE "cars" ADD CONSTRAINT "cars_model_not_empty" CHECK (length(trim(model)) > 0);--> statement-breakpoint
ALTER TABLE "car_images" ADD CONSTRAINT "car_images_url_not_empty" CHECK (length(trim(url)) > 0);--> statement-breakpoint
ALTER TABLE "car_images" ADD CONSTRAINT "car_images_sort_order_non_negative" CHECK (sort_order >= 0);--> statement-breakpoint

-- Full-text search column
ALTER TABLE "cars" ADD COLUMN IF NOT EXISTS "search_vector" tsvector
  GENERATED ALWAYS AS (
    to_tsvector(
      'simple',
      coalesce(title, '') || ' ' ||
      coalesce(brand, '') || ' ' ||
      coalesce(model, '') || ' ' ||
      coalesce(location, '')
    )
  ) STORED;--> statement-breakpoint

-- Partial & composite indexes (active listings only)
CREATE INDEX IF NOT EXISTS "idx_users_active" ON "users" ("id") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cars_transmission" ON "cars" ("transmission");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cars_active_list" ON "cars" ("created_at" DESC) WHERE is_active = TRUE AND deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cars_filter_combo" ON "cars" ("brand", "fuel_type", "transmission", "year", "price") WHERE is_active = TRUE AND deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cars_price_year" ON "cars" ("price", "year") WHERE is_active = TRUE AND deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cars_search_vector" ON "cars" USING GIN ("search_vector");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cars_title_trgm" ON "cars" USING GIN ("title" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cars_brand_trgm" ON "cars" USING GIN ("brand" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_favorites_user_created" ON "favorites" ("user_id", "created_at" DESC);--> statement-breakpoint

-- updated_at triggers
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint

DROP TRIGGER IF EXISTS users_set_updated_at ON "users";--> statement-breakpoint
CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON "users"
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();--> statement-breakpoint

DROP TRIGGER IF EXISTS cars_set_updated_at ON "cars";--> statement-breakpoint
CREATE TRIGGER cars_set_updated_at
  BEFORE UPDATE ON "cars"
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();--> statement-breakpoint

-- RLS helper functions
CREATE OR REPLACE FUNCTION app_bypass_rls()
RETURNS BOOLEAN AS $$
  SELECT coalesce(current_setting('app.bypass_rls', true), '') = 'true';
$$ LANGUAGE sql STABLE;--> statement-breakpoint

CREATE OR REPLACE FUNCTION app_current_user_id()
RETURNS UUID AS $$
  SELECT NULLIF(current_setting('app.user_id', true), '')::UUID;
$$ LANGUAGE sql STABLE;--> statement-breakpoint

CREATE OR REPLACE FUNCTION app_is_visible_car(car_row cars)
RETURNS BOOLEAN AS $$
  SELECT car_row.is_active = TRUE AND car_row.deleted_at IS NULL;
$$ LANGUAGE sql STABLE;--> statement-breakpoint

-- Enable RLS
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "cars" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "car_images" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "favorites" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

-- users policies
DROP POLICY IF EXISTS users_select_public ON "users";--> statement-breakpoint
CREATE POLICY users_select_public ON "users" FOR SELECT
  USING (deleted_at IS NULL OR app_bypass_rls() OR id = app_current_user_id());--> statement-breakpoint

DROP POLICY IF EXISTS users_insert_server ON "users";--> statement-breakpoint
CREATE POLICY users_insert_server ON "users" FOR INSERT
  WITH CHECK (app_bypass_rls());--> statement-breakpoint

DROP POLICY IF EXISTS users_update_self_or_server ON "users";--> statement-breakpoint
CREATE POLICY users_update_self_or_server ON "users" FOR UPDATE
  USING (app_bypass_rls() OR id = app_current_user_id())
  WITH CHECK (app_bypass_rls() OR id = app_current_user_id());--> statement-breakpoint

DROP POLICY IF EXISTS users_delete_server ON "users";--> statement-breakpoint
CREATE POLICY users_delete_server ON "users" FOR DELETE
  USING (app_bypass_rls());--> statement-breakpoint

-- cars policies
DROP POLICY IF EXISTS cars_select_visible ON "cars";--> statement-breakpoint
CREATE POLICY cars_select_visible ON "cars" FOR SELECT
  USING (app_bypass_rls() OR app_is_visible_car(cars) OR user_id = app_current_user_id());--> statement-breakpoint

DROP POLICY IF EXISTS cars_insert_owner ON "cars";--> statement-breakpoint
CREATE POLICY cars_insert_owner ON "cars" FOR INSERT
  WITH CHECK (app_bypass_rls() OR user_id = app_current_user_id());--> statement-breakpoint

DROP POLICY IF EXISTS cars_update_owner_or_server ON "cars";--> statement-breakpoint
CREATE POLICY cars_update_owner_or_server ON "cars" FOR UPDATE
  USING (app_bypass_rls() OR user_id = app_current_user_id())
  WITH CHECK (app_bypass_rls() OR user_id = app_current_user_id());--> statement-breakpoint

DROP POLICY IF EXISTS cars_delete_owner_or_server ON "cars";--> statement-breakpoint
CREATE POLICY cars_delete_owner_or_server ON "cars" FOR DELETE
  USING (app_bypass_rls() OR user_id = app_current_user_id());--> statement-breakpoint

-- car_images policies
DROP POLICY IF EXISTS car_images_select_visible ON "car_images";--> statement-breakpoint
CREATE POLICY car_images_select_visible ON "car_images" FOR SELECT
  USING (
    app_bypass_rls()
    OR EXISTS (
      SELECT 1 FROM cars c
      WHERE c.id = car_images.car_id
        AND (app_is_visible_car(c) OR c.user_id = app_current_user_id())
    )
  );--> statement-breakpoint

DROP POLICY IF EXISTS car_images_insert_owner ON "car_images";--> statement-breakpoint
CREATE POLICY car_images_insert_owner ON "car_images" FOR INSERT
  WITH CHECK (
    app_bypass_rls()
    OR EXISTS (
      SELECT 1 FROM cars c
      WHERE c.id = car_images.car_id AND c.user_id = app_current_user_id()
    )
  );--> statement-breakpoint

DROP POLICY IF EXISTS car_images_update_owner_or_server ON "car_images";--> statement-breakpoint
CREATE POLICY car_images_update_owner_or_server ON "car_images" FOR UPDATE
  USING (
    app_bypass_rls()
    OR EXISTS (
      SELECT 1 FROM cars c
      WHERE c.id = car_images.car_id AND c.user_id = app_current_user_id()
    )
  );--> statement-breakpoint

DROP POLICY IF EXISTS car_images_delete_owner_or_server ON "car_images";--> statement-breakpoint
CREATE POLICY car_images_delete_owner_or_server ON "car_images" FOR DELETE
  USING (
    app_bypass_rls()
    OR EXISTS (
      SELECT 1 FROM cars c
      WHERE c.id = car_images.car_id AND c.user_id = app_current_user_id()
    )
  );--> statement-breakpoint

-- favorites policies
DROP POLICY IF EXISTS favorites_select_own_or_server ON "favorites";--> statement-breakpoint
CREATE POLICY favorites_select_own_or_server ON "favorites" FOR SELECT
  USING (app_bypass_rls() OR user_id = app_current_user_id());--> statement-breakpoint

DROP POLICY IF EXISTS favorites_insert_own ON "favorites";--> statement-breakpoint
CREATE POLICY favorites_insert_own ON "favorites" FOR INSERT
  WITH CHECK (app_bypass_rls() OR user_id = app_current_user_id());--> statement-breakpoint

DROP POLICY IF EXISTS favorites_delete_own ON "favorites";--> statement-breakpoint
CREATE POLICY favorites_delete_own ON "favorites" FOR DELETE
  USING (app_bypass_rls() OR user_id = app_current_user_id());
