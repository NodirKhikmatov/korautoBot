ALTER TABLE "cars" ADD COLUMN "view_count" integer DEFAULT 0 NOT NULL;
ALTER TABLE "cars" ADD COLUMN "contact_count" integer DEFAULT 0 NOT NULL;

CREATE TABLE "car_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"car_id" uuid NOT NULL,
	"viewer_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "car_views_car_id_viewer_key_unique" UNIQUE("car_id","viewer_key"),
	CONSTRAINT "car_views_viewer_key_not_empty" CHECK (length(trim("viewer_key")) > 0)
);
--> statement-breakpoint
CREATE TABLE "car_contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"car_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "car_contacts_car_id_user_id_unique" UNIQUE("car_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "car_views" ADD CONSTRAINT "car_views_car_id_cars_id_fk" FOREIGN KEY ("car_id") REFERENCES "public"."cars"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "car_contacts" ADD CONSTRAINT "car_contacts_car_id_cars_id_fk" FOREIGN KEY ("car_id") REFERENCES "public"."cars"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "car_contacts" ADD CONSTRAINT "car_contacts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "idx_car_views_car_id" ON "car_views" USING btree ("car_id");
--> statement-breakpoint
CREATE INDEX "idx_car_contacts_car_id" ON "car_contacts" USING btree ("car_id");
--> statement-breakpoint
CREATE INDEX "idx_car_contacts_user_id" ON "car_contacts" USING btree ("user_id");
--> statement-breakpoint
ALTER TABLE "cars" ADD CONSTRAINT "cars_view_count_non_negative" CHECK ("view_count" >= 0);
--> statement-breakpoint
ALTER TABLE "cars" ADD CONSTRAINT "cars_contact_count_non_negative" CHECK ("contact_count" >= 0);
