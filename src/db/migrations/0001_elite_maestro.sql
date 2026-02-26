CREATE TABLE "mesta" (
	"mesto_id" serial PRIMARY KEY NOT NULL,
	"oznaka" text NOT NULL,
	"region_sedenja_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "rezervisana_mesta" RENAME COLUMN "id" TO "rezervisano_mesto_id";--> statement-breakpoint
ALTER TABLE "cena_karte" DROP CONSTRAINT "cena_karte_koncert_id_koncerti_koncert_id_fk";
--> statement-breakpoint
ALTER TABLE "rezervisana_mesta" DROP CONSTRAINT "rezervisana_mesta_region_sedenja_id_region_sedenja_region_sedenja_id_fk";
--> statement-breakpoint
ALTER TABLE "rezervisana_mesta" ADD COLUMN "mesto_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "mesta" ADD CONSTRAINT "mesta_region_sedenja_id_region_sedenja_region_sedenja_id_fk" FOREIGN KEY ("region_sedenja_id") REFERENCES "public"."region_sedenja"("region_sedenja_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rezervisana_mesta" ADD CONSTRAINT "rezervisana_mesta_mesto_id_mesta_mesto_id_fk" FOREIGN KEY ("mesto_id") REFERENCES "public"."mesta"("mesto_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cena_karte" DROP COLUMN "koncert_id";--> statement-breakpoint
ALTER TABLE "rezervisana_mesta" DROP COLUMN "region_sedenja_id";