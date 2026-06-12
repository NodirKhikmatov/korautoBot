CREATE TYPE "public"."fuel_type" AS ENUM('gasoline', 'diesel', 'electric', 'hybrid', 'lpg');--> statement-breakpoint
CREATE TYPE "public"."transmission" AS ENUM('automatic', 'manual');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"telegram_id" bigint NOT NULL,
	"username" text,
	"first_name" text,
	"last_name" text,
	"photo_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_telegram_id_unique" UNIQUE("telegram_id")
);
--> statement-breakpoint
CREATE TABLE "cars" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"brand" text NOT NULL,
	"model" text NOT NULL,
	"year" integer NOT NULL,
	"price" bigint NOT NULL,
	"mileage" integer NOT NULL,
	"fuel_type" "fuel_type" NOT NULL,
	"transmission" "transmission" NOT NULL,
	"description" text,
	"location" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "car_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"car_id" uuid NOT NULL,
	"url" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"car_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "favorites_user_id_car_id_unique" UNIQUE("user_id","car_id")
);
--> statement-breakpoint
ALTER TABLE "cars" ADD CONSTRAINT "cars_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "car_images" ADD CONSTRAINT "car_images_car_id_cars_id_fk" FOREIGN KEY ("car_id") REFERENCES "public"."cars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_car_id_cars_id_fk" FOREIGN KEY ("car_id") REFERENCES "public"."cars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_users_telegram_id" ON "users" USING btree ("telegram_id");--> statement-breakpoint
CREATE INDEX "idx_users_deleted_at" ON "users" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_cars_user_id" ON "cars" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_cars_is_active" ON "cars" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_cars_deleted_at" ON "cars" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_cars_brand" ON "cars" USING btree ("brand");--> statement-breakpoint
CREATE INDEX "idx_cars_price" ON "cars" USING btree ("price");--> statement-breakpoint
CREATE INDEX "idx_cars_year" ON "cars" USING btree ("year");--> statement-breakpoint
CREATE INDEX "idx_cars_fuel_type" ON "cars" USING btree ("fuel_type");--> statement-breakpoint
CREATE INDEX "idx_cars_location" ON "cars" USING btree ("location");--> statement-breakpoint
CREATE INDEX "idx_cars_created_at" ON "cars" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_car_images_car_id" ON "car_images" USING btree ("car_id");--> statement-breakpoint
CREATE INDEX "idx_car_images_sort_order" ON "car_images" USING btree ("car_id","sort_order");--> statement-breakpoint
CREATE INDEX "idx_favorites_user_id" ON "favorites" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_favorites_car_id" ON "favorites" USING btree ("car_id");
