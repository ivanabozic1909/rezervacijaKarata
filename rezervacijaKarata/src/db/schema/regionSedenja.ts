import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { koncerti } from "./koncert";
import { lokacije } from "./lokacija";
import { cenaKarte } from "./cenaKarte";
import { mesta } from "./mesto";

export const regionSedenja = pgTable("region_sedenja", {
  regionSedenjaId: serial("region_sedenja_id").primaryKey(),

  naziv: text("naziv").notNull(),

  // Kapacitet sada predstavlja broj mesta u tom regionu
  kapacitet: integer("kapacitet").notNull(),

  koncertId: integer("koncert_id")
    .references(() => koncerti.koncertId),

  lokacijaId: integer("lokacija_id")
    .references(() => lokacije.lokacijaId)
    .notNull(),
});

export const regionSedenjaRelations = relations(
  regionSedenja,
  ({ one, many }) => ({
    koncert: one(koncerti, {
      fields: [regionSedenja.koncertId],
      references: [koncerti.koncertId],
    }),

    lokacija: one(lokacije, {
      fields: [regionSedenja.lokacijaId],
      references: [lokacije.lokacijaId],
    }),

    ceneKarata: many(cenaKarte),

    // 🔥 NOVO — region ima više mesta
    mesta: many(mesta),
  })
);