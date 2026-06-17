ALTER TABLE "cars" ADD COLUMN IF NOT EXISTS "sold_at" timestamp with time zone;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cars_sold_at" ON "cars" USING btree ("sold_at") WHERE "sold_at" IS NOT NULL;
