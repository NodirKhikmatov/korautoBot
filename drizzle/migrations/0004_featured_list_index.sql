CREATE INDEX IF NOT EXISTS "idx_cars_featured_list" ON "cars" ("created_at") WHERE is_featured = TRUE AND is_active = TRUE AND deleted_at IS NULL;
