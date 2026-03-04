import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { koncerti } from "./koncert";
import { regionSedenja } from "./regionSedenja";

export const lokacije = pgTable("lokacije", {
  lokacijaId: serial("lokacija_id").primaryKey(),
  naziv: text("naziv").notNull(),
  mesto: text("mesto").notNull(),
  adresa: text("adresa").notNull(),
  ukupanKapacitet: integer("ukupan_kapacitet").notNull(),
});

export const lokacijeRelations = relations(lokacije, ({ many }) => ({
  koncerti: many(koncerti),
  regioniSedenja: many(regionSedenja),
}));