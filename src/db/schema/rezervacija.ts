import { pgTable, serial, text, boolean, numeric, timestamp, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { koncerti } from "./koncert";
import { valute } from "./valuta";
import { drzave } from "./drzava";
import { promoKodovi } from "./promoKod";
import { rezervisanaMesta } from "./rezervisanoMesto";

export const rezervacije = pgTable("rezervacije", {
  rezervacijaId: serial("rezervacija_id").primaryKey(),
  datumKreiranja: timestamp("datum_kreiranja").defaultNow().notNull(),
  status: text("status").notNull(),
  sifra: text("sifra").notNull(),

  ime: text("ime").notNull(),
  prezime: text("prezime").notNull(),
  email: text("email").notNull(),
  adresa: text("adresa"),
  brojTelefona: text("broj_telefona"),
  postanskiBroj: text("postanski_broj").notNull(),
  mesto: text("mesto").notNull(),

  ukupnaCena: numeric("ukupna_cena").notNull(),

  koncertId: integer("koncert_id")
    .references(() => koncerti.koncertId)
    .notNull(),

  valutaId: integer("valuta_id")
    .references(() => valute.valutaId)
    .notNull(),

  drzavaId: integer("drzava_id")
    .references(() => drzave.drzavaId)
    .notNull(),

 
});

export const rezervacijeRelations = relations(rezervacije, ({ one, many }) => ({
  koncert: one(koncerti, {
    fields: [rezervacije.koncertId],
    references: [koncerti.koncertId],
  }),

  valuta: one(valute, {
    fields: [rezervacije.valutaId],
    references: [valute.valutaId],
  }),

  drzava: one(drzave, {
    fields: [rezervacije.drzavaId],
    references: [drzave.drzavaId],
  }),

  rezervisanaMesta: many(rezervisanaMesta),
}));