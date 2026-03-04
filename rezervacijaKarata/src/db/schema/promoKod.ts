import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { rezervacije } from "./rezervacija";

export const promoKodovi = pgTable("promo_kod", {
  promoKodId: serial("promo_kod_id").primaryKey(),

  kod: text("kod").notNull(),

  // Aktivan | Iskoriscen | Neaktivan
  status: text("status").notNull(),

  // Rezervacija koja ga je kreirala
  kreiranIzRezervacijeId: integer("kreiran_iz_rezervacije_id")
    .references(() => rezervacije.rezervacijaId)
    .notNull(),

  // Rezervacija koja ga je iskoristila (nullable)
  iskoriscenURezervacijiId: integer("iskoriscen_u_rezervacije_id")
    .references(() => rezervacije.rezervacijaId),
});
export const promoKodRelations = relations(promoKodovi, ({ one }) => ({
  kreiranIzRezervacije: one(rezervacije, {
    fields: [promoKodovi.kreiranIzRezervacijeId],
    references: [rezervacije.rezervacijaId],
  }),

  iskoriscenURezervaciji: one(rezervacije, {
    fields: [promoKodovi.iskoriscenURezervacijiId],
    references: [rezervacije.rezervacijaId],
  }),
}));