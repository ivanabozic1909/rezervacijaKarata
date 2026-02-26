import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { regionSedenja } from "./regionSedenja";
import { rezervisanaMesta } from "./rezervisanoMesto";

export const mesta = pgTable("mesta", {
  mestoId: serial("mesto_id").primaryKey(),

  // Oznaka mesta (VIP-1, A12, B3...)
  oznaka: text("oznaka").notNull(),

  // Region kome mesto pripada
  regionSedenjaId: integer("region_sedenja_id")
    .references(() => regionSedenja.regionSedenjaId)
    .notNull(),
});

export const mestaRelations = relations(mesta, ({ one, many }) => ({
  // Mesto pripada jednom regionu
  region: one(regionSedenja, {
    fields: [mesta.regionSedenjaId],
    references: [regionSedenja.regionSedenjaId],
  }),

  // Jedno mesto može biti povezano sa jednom rezervacijom
  // (preko spojne tabele)
  rezervacije: many(rezervisanaMesta),
}));