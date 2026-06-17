ALTER TABLE "cars"
  ADD COLUMN IF NOT EXISTS "seller_display_name" text,
  ADD COLUMN IF NOT EXISTS "seller_username" text,
  ADD COLUMN IF NOT EXISTS "seller_telegram_id" bigint,
  ADD COLUMN IF NOT EXISTS "seller_phone" text;

CREATE INDEX IF NOT EXISTS "idx_cars_seller_username" ON "cars" ("seller_username")
  WHERE "seller_username" IS NOT NULL AND "deleted_at" IS NULL;
