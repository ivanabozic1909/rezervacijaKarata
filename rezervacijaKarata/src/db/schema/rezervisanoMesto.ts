import { pgTable, serial, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { rezervacije } from "./rezervacija";
import { mesta } from "./mesto";

export const rezervisanaMesta = pgTable("rezervisana_mesta", {
  rezervisanoMestoId: serial("rezervisano_mesto_id").primaryKey(),

  rezervacijaId: integer("rezervacija_id")
    .references(() => rezervacije.rezervacijaId)
    .notNull(),

  // 🔥 UMESTO regionSedenjaId sada ide mestoId
  mestoId: integer("mesto_id")
    .references(() => mesta.mestoId)
    .notNull(),
});

export const rezervisanaMestaRelations = relations(
  rezervisanaMesta,
  ({ one }) => ({
    rezervacija: one(rezervacije, {
      fields: [rezervisanaMesta.rezervacijaId],
      references: [rezervacije.rezervacijaId],
    }),

    mesto: one(mesta, {
      fields: [rezervisanaMesta.mestoId],
      references: [mesta.mestoId],
    }),
  })
);