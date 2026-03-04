import { pgTable, serial, varchar, integer, timestamp, decimal } from "drizzle-orm/pg-core";

// Feature 1: Broj kupljenih karata po koncertima
export const statistikaKoncerti = pgTable("statistika_koncerti", {
  id: serial("id").primaryKey(),
  koncertId: integer("koncert_id").notNull().unique(),
  nazivKoncerta: varchar("naziv_koncerta", { length: 255 }).notNull(),
  brojKupljenihKarata: integer("broj_kupljenih_karata").default(0),
  ukupnaZarada: decimal("ukupna_zarada", { precision: 12, scale: 2 }).default("0"),
  poslednjaIzmena: timestamp("poslednja_izmena").defaultNow(),
});

// Feature 2: Broj kupljenih karata po lokacijama
export const statistikaLokacije = pgTable("statistika_lokacije", {
  id: serial("id").primaryKey(),
  lokacijaId: integer("lokacija_id").notNull().unique(),
  nazivLokacije: varchar("naziv_lokacije", { length: 255 }).notNull(),
  ukupnoProdato: integer("ukupno_prodato").default(0),
});