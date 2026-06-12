ALTER TABLE "car_images" ADD COLUMN IF NOT EXISTS "thumbnail_url" text;--> statement-breakpoint
UPDATE "car_images" SET "thumbnail_url" = "url" WHERE "thumbnail_url" IS NULL;--> statement-breakpoint
ALTER TABLE "car_images" ALTER COLUMN "thumbnail_url" SET NOT NULL;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "car_images" ADD CONSTRAINT "car_images_thumbnail_url_not_empty" CHECK (length(trim("thumbnail_url")) > 0);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
