ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" text;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "users" ADD CONSTRAINT "users_phone_not_empty" CHECK ("phone" IS NULL OR length(trim("phone")) > 0);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
