import { pgTable, serial, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { regionSedenja } from "./regionSedenja";

export const cenaKarte = pgTable("cena_karte", {
  cenaKarteId: serial("cena_karte_id").primaryKey(),

  iznos: numeric("iznos").notNull(),

  // datum do kog važi 10% popust
  datumVazenjaPopusta: timestamp("datum_vazenja_popusta"),

  regionSedenjaId: integer("region_sedenja_id")
    .references(() => regionSedenja.regionSedenjaId)
    .notNull(),
});

export const cenaKarteRelations = relations(cenaKarte, ({ one }) => ({
  regionSedenja: one(regionSedenja, {
    fields: [cenaKarte.regionSedenjaId],
    references: [regionSedenja.regionSedenjaId],
  }),
}));