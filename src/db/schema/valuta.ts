import { pgTable, serial, text, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { rezervacije } from "./rezervacija";

export const valute = pgTable("valute", {
  valutaId: serial("valuta_id").primaryKey(),
  kod: text("kod").notNull(),
  naziv: text("naziv").notNull(),
  aktivna: boolean("aktivna").notNull().default(true),
});

export const valuteRelations = relations(valute, ({ many }) => ({
  rezervacije: many(rezervacije),
}));