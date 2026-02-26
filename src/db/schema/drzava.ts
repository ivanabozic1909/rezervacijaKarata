import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { rezervacije } from "./rezervacija";

export const drzave = pgTable("drzave", {
  drzavaId: serial("drzava_id").primaryKey(),
  naziv: text("naziv").notNull(),
});

export const drzaveRelations = relations(drzave, ({ many }) => ({
  rezervacije: many(rezervacije),
}));