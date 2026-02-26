import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const valute = pgTable("valute", {
  valutaId: serial("valuta_id").primaryKey(),
  kod: varchar("kod", { length: 10 }).notNull(),
  naziv: varchar("naziv", { length: 100 }).notNull(),
});
