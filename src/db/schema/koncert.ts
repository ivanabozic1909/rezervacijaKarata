import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { kategorije } from "./kategorija";
import { lokacije } from "./lokacija";
import { regionSedenja } from "./regionSedenja";
import { rezervacije } from "./rezervacija";
import { cenaKarte } from "./cenaKarte";

export const koncerti = pgTable("koncerti", {
  koncertId: serial("koncert_id").primaryKey(),
  naziv: text("naziv").notNull(),
  opis: text("opis"),

  datumVreme: timestamp("datum_vreme").notNull(),

  kategorijaId: integer("kategorija_id")
    .references(() => kategorije.kategorijaId)
    .notNull(),

  lokacijaId: integer("lokacija_id")
    .references(() => lokacije.lokacijaId)
    .notNull(),
});

export const koncertiRelations = relations(koncerti, ({ one, many }) => ({
  kategorija: one(kategorije, {
    fields: [koncerti.kategorijaId],
    references: [kategorije.kategorijaId],
  }),

  lokacija: one(lokacije, {
    fields: [koncerti.lokacijaId],
    references: [lokacije.lokacijaId],
  }),

  ceneKarata: many(cenaKarte),  // 👈 DODAJ OVO

  rezervacije: many(rezervacije),
})); 