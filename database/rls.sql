-- =============================================================================
-- Korea Auto Market — Row Level Security
-- Session context (set per transaction from the Next.js API layer):
--   SET LOCAL app.bypass_rls = 'true';   — server/admin operations
--   SET LOCAL app.user_id = '<uuid>';    — user-scoped operations
-- =============================================================================

-- Helper functions (stable, security definer not needed)

CREATE OR REPLACE FUNCTION app_bypass_rls()
RETURNS BOOLEAN AS $$
  SELECT coalesce(current_setting('app.bypass_rls', true), '') = 'true';
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION app_current_user_id()
RETURNS UUID AS $$
  SELECT NULLIF(current_setting('app.user_id', true), '')::UUID;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION app_is_visible_car(car_row cars)
RETURNS BOOLEAN AS $$
  SELECT car_row.is_active = TRUE AND car_row.deleted_at IS NULL;
$$ LANGUAGE sql STABLE;

-- -----------------------------------------------------------------------------
-- users
-- -----------------------------------------------------------------------------

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_select_public
  ON users FOR SELECT
  USING (deleted_at IS NULL OR app_bypass_rls() OR id = app_current_user_id());

CREATE POLICY users_insert_server
  ON users FOR INSERT
  WITH CHECK (app_bypass_rls());

CREATE POLICY users_update_self_or_server
  ON users FOR UPDATE
  USING (app_bypass_rls() OR id = app_current_user_id())
  WITH CHECK (app_bypass_rls() OR id = app_current_user_id());

CREATE POLICY users_delete_server
  ON users FOR DELETE
  USING (app_bypass_rls());

-- -----------------------------------------------------------------------------
-- cars
-- -----------------------------------------------------------------------------

ALTER TABLE cars ENABLE ROW LEVEL SECURITY;

CREATE POLICY cars_select_visible
  ON cars FOR SELECT
  USING (
    app_bypass_rls()
    OR app_is_visible_car(cars)
    OR user_id = app_current_user_id()
  );

CREATE POLICY cars_insert_owner
  ON cars FOR INSERT
  WITH CHECK (app_bypass_rls() OR user_id = app_current_user_id());

CREATE POLICY cars_update_owner_or_server
  ON cars FOR UPDATE
  USING (app_bypass_rls() OR user_id = app_current_user_id())
  WITH CHECK (app_bypass_rls() OR user_id = app_current_user_id());

CREATE POLICY cars_delete_owner_or_server
  ON cars FOR DELETE
  USING (app_bypass_rls() OR user_id = app_current_user_id());

-- -----------------------------------------------------------------------------
-- car_images
-- -----------------------------------------------------------------------------

ALTER TABLE car_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY car_images_select_visible
  ON car_images FOR SELECT
  USING (
    app_bypass_rls()
    OR EXISTS (
      SELECT 1 FROM cars c
      WHERE c.id = car_images.car_id
        AND (app_is_visible_car(c) OR c.user_id = app_current_user_id())
    )
  );

CREATE POLICY car_images_insert_owner
  ON car_images FOR INSERT
  WITH CHECK (
    app_bypass_rls()
    OR EXISTS (
      SELECT 1 FROM cars c
      WHERE c.id = car_images.car_id AND c.user_id = app_current_user_id()
    )
  );

CREATE POLICY car_images_update_owner_or_server
  ON car_images FOR UPDATE
  USING (
    app_bypass_rls()
    OR EXISTS (
      SELECT 1 FROM cars c
      WHERE c.id = car_images.car_id AND c.user_id = app_current_user_id()
    )
  );

CREATE POLICY car_images_delete_owner_or_server
  ON car_images FOR DELETE
  USING (
    app_bypass_rls()
    OR EXISTS (
      SELECT 1 FROM cars c
      WHERE c.id = car_images.car_id AND c.user_id = app_current_user_id()
    )
  );

-- -----------------------------------------------------------------------------
-- favorites
-- -----------------------------------------------------------------------------

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY favorites_select_own_or_server
  ON favorites FOR SELECT
  USING (app_bypass_rls() OR user_id = app_current_user_id());

CREATE POLICY favorites_insert_own
  ON favorites FOR INSERT
  WITH CHECK (app_bypass_rls() OR user_id = app_current_user_id());

CREATE POLICY favorites_delete_own
  ON favorites FOR DELETE
  USING (app_bypass_rls() OR user_id = app_current_user_id());
