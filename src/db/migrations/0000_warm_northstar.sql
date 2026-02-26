CREATE TABLE "cena_karte" (
	"cena_karte_id" serial PRIMARY KEY NOT NULL,
	"iznos" numeric NOT NULL,
	"datum_vazenja_popusta" timestamp,
	"koncert_id" integer NOT NULL,
	"region_sedenja_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "drzave" (
	"drzava_id" serial PRIMARY KEY NOT NULL,
	"naziv" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "valute" (
	"valuta_id" serial PRIMARY KEY NOT NULL,
	"kod" varchar(10) NOT NULL,
	"naziv" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kategorije" (
	"kategorija_id" serial PRIMARY KEY NOT NULL,
	"naziv" text NOT NULL,
	"opis" text
);
--> statement-breakpoint
CREATE TABLE "lokacije" (
	"lokacija_id" serial PRIMARY KEY NOT NULL,
	"naziv" text NOT NULL,
	"mesto" text NOT NULL,
	"adresa" text NOT NULL,
	"ukupan_kapacitet" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "koncerti" (
	"koncert_id" serial PRIMARY KEY NOT NULL,
	"naziv" text NOT NULL,
	"opis" text,
	"datum_vreme" timestamp NOT NULL,
	"kategorija_id" integer NOT NULL,
	"lokacija_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "region_sedenja" (
	"region_sedenja_id" serial PRIMARY KEY NOT NULL,
	"naziv" text NOT NULL,
	"kapacitet" integer NOT NULL,
	"koncert_id" integer NOT NULL,
	"lokacija_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promo_kod" (
	"promo_kod_id" serial PRIMARY KEY NOT NULL,
	"kod" text NOT NULL,
	"status" text NOT NULL,
	"kreiran_iz_rezervacije_id" integer NOT NULL,
	"iskoriscen_u_rezervacije_id" integer
);
--> statement-breakpoint
CREATE TABLE "rezervacije" (
	"rezervacija_id" serial PRIMARY KEY NOT NULL,
	"datum_kreiranja" timestamp NOT NULL,
	"je_aktivna" boolean NOT NULL,
	"sifra" text NOT NULL,
	"ime" text NOT NULL,
	"prezime" text NOT NULL,
	"email" text NOT NULL,
	"adresa" text,
	"broj_telefona" text,
	"ukupna_cena" numeric NOT NULL,
	"koncert_id" integer NOT NULL,
	"valuta_id" integer NOT NULL,
	"drzava_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rezervisana_mesta" (
	"id" serial PRIMARY KEY NOT NULL,
	"rezervacija_id" integer NOT NULL,
	"region_sedenja_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cena_karte" ADD CONSTRAINT "cena_karte_koncert_id_koncerti_koncert_id_fk" FOREIGN KEY ("koncert_id") REFERENCES "public"."koncerti"("koncert_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cena_karte" ADD CONSTRAINT "cena_karte_region_sedenja_id_region_sedenja_region_sedenja_id_fk" FOREIGN KEY ("region_sedenja_id") REFERENCES "public"."region_sedenja"("region_sedenja_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "koncerti" ADD CONSTRAINT "koncerti_kategorija_id_kategorije_kategorija_id_fk" FOREIGN KEY ("kategorija_id") REFERENCES "public"."kategorije"("kategorija_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "koncerti" ADD CONSTRAINT "koncerti_lokacija_id_lokacije_lokacija_id_fk" FOREIGN KEY ("lokacija_id") REFERENCES "public"."lokacije"("lokacija_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "region_sedenja" ADD CONSTRAINT "region_sedenja_koncert_id_koncerti_koncert_id_fk" FOREIGN KEY ("koncert_id") REFERENCES "public"."koncerti"("koncert_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "region_sedenja" ADD CONSTRAINT "region_sedenja_lokacija_id_lokacije_lokacija_id_fk" FOREIGN KEY ("lokacija_id") REFERENCES "public"."lokacije"("lokacija_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promo_kod" ADD CONSTRAINT "promo_kod_kreiran_iz_rezervacije_id_rezervacije_rezervacija_id_fk" FOREIGN KEY ("kreiran_iz_rezervacije_id") REFERENCES "public"."rezervacije"("rezervacija_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promo_kod" ADD CONSTRAINT "promo_kod_iskoriscen_u_rezervacije_id_rezervacije_rezervacija_id_fk" FOREIGN KEY ("iskoriscen_u_rezervacije_id") REFERENCES "public"."rezervacije"("rezervacija_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rezervacije" ADD CONSTRAINT "rezervacije_koncert_id_koncerti_koncert_id_fk" FOREIGN KEY ("koncert_id") REFERENCES "public"."koncerti"("koncert_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rezervacije" ADD CONSTRAINT "rezervacije_valuta_id_valute_valuta_id_fk" FOREIGN KEY ("valuta_id") REFERENCES "public"."valute"("valuta_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rezervacije" ADD CONSTRAINT "rezervacije_drzava_id_drzave_drzava_id_fk" FOREIGN KEY ("drzava_id") REFERENCES "public"."drzave"("drzava_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rezervisana_mesta" ADD CONSTRAINT "rezervisana_mesta_rezervacija_id_rezervacije_rezervacija_id_fk" FOREIGN KEY ("rezervacija_id") REFERENCES "public"."rezervacije"("rezervacija_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rezervisana_mesta" ADD CONSTRAINT "rezervisana_mesta_region_sedenja_id_region_sedenja_region_sedenja_id_fk" FOREIGN KEY ("region_sedenja_id") REFERENCES "public"."region_sedenja"("region_sedenja_id") ON DELETE no action ON UPDATE no action;