import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { koncerti } from "./koncert";

export const kategorije = pgTable("kategorije", {
  kategorijaId: serial("kategorija_id").primaryKey(),
  naziv: text("naziv").notNull(),
  opis: text("opis"),
});

export const kategorijeRelations = relations(kategorije, ({ many }) => ({
  koncerti: many(koncerti),
}));