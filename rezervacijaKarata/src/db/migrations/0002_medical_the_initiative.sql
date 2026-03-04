ALTER TABLE "rezervacije" RENAME COLUMN "je_aktivna" TO "status";--> statement-breakpoint
ALTER TABLE "rezervacije" ALTER COLUMN "datum_kreiranja" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "rezervacije" ADD COLUMN "postanski_broj" text NOT NULL;--> statement-breakpoint
ALTER TABLE "rezervacije" ADD COLUMN "mesto" text NOT NULL;