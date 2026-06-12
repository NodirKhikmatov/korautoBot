ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_admin" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "banned_at" timestamptz;--> statement-breakpoint
ALTER TABLE "cars" ADD COLUMN IF NOT EXISTS "is_featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_banned_at" ON "users" ("banned_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cars_is_featured" ON "cars" ("is_featured") WHERE is_active = TRUE AND deleted_at IS NULL;
