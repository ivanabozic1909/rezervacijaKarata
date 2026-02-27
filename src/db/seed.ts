import "dotenv/config";
import { db } from "./index";

import { drzave } from "./schema/drzava";
import { valute } from "./schema/valuta";
import { kategorije } from "./schema/kategorija";
import { lokacije } from "./schema/lokacija";
import { koncerti } from "./schema/koncert";
import { regionSedenja } from "./schema/regionSedenja";
import { cenaKarte } from "./schema/cenaKarte";
import { mesta } from "./schema/mesto";

async function seed() {
  try {
    console.log("🌱 Seeding database...");

    // ======================
    // DRŽAVE
    // ======================
    const insertedDrzave = await db.insert(drzave).values([
      { naziv: "Srbija" },
      { naziv: "Hrvatska" },
      { naziv: "Bosna i Hercegovina" },
    ]).returning();

    const srbija = insertedDrzave[0];

    // ======================
    // VALUTE
    // ======================
    const insertedValute = await db.insert(valute).values([
      { kod: "RSD", naziv: "Dinar" },
      { kod: "EUR", naziv: "Evro" },
      { kod: "USD", naziv: "Dolar" },
    ]).returning();

    const rsd = insertedValute[0];

    // ======================
    // KATEGORIJA
    // ======================
    const [kategorija] = await db.insert(kategorije).values({
      naziv: "Pop",
      opis: "Pop muzika",
    }).returning();

    // ======================
    // LOKACIJA
    // ======================
    const [lokacija] = await db.insert(lokacije).values({
      naziv: "Štark Arena",
      mesto: "Beograd",
      adresa: "Bulevar Arsenija Čarnojevića 58",
      ukupanKapacitet: 20000,
    }).returning();

    // ======================
    // KONCERT
    // ======================
    const [koncert] = await db.insert(koncerti).values({
      naziv: "Veliki Spektakl 2026",
      opis: "Najveći koncert godine",
      datumVreme: new Date("2026-06-15T20:00:00"),
      kategorijaId: kategorija.kategorijaId,
      lokacijaId: lokacija.lokacijaId,
    }).returning();

    // ======================
    // REGIONI
    // ======================
    const insertedRegioni = await db.insert(regionSedenja).values([
      {
        naziv: "VIP",
        kapacitet: 20,
        koncertId: koncert.koncertId,
        lokacijaId: lokacija.lokacijaId,
      },
      {
        naziv: "Parter",
        kapacitet: 30,
        koncertId: koncert.koncertId,
        lokacijaId: lokacija.lokacijaId,
      },
    ]).returning();

    const vipRegion = insertedRegioni[0];
    const parterRegion = insertedRegioni[1];

    // ======================
    // CENE PO REGIONU
    // ======================
    await db.insert(cenaKarte).values([
      {
        iznos: "8000",
        datumVazenjaPopusta: new Date("2026-05-01"),
        regionSedenjaId: vipRegion.regionSedenjaId,
      },
      {
        iznos: "4000",
        datumVazenjaPopusta: new Date("2026-05-01"),
        regionSedenjaId: parterRegion.regionSedenjaId,
      },
    ]);

    // ======================
    // GENERISANJE MESTA
    // ======================
    const vipMesta = Array.from({ length: 20 }, (_, i) => ({
      oznaka: `VIP-${i + 1}`,
      regionSedenjaId: vipRegion.regionSedenjaId,
    }));

    const parterMesta = Array.from({ length: 30 }, (_, i) => ({
      oznaka: `P-${i + 1}`,
      regionSedenjaId: parterRegion.regionSedenjaId,
    }));

    await db.insert(mesta).values([...vipMesta, ...parterMesta]);

    console.log("✅ Seed uspešno završen!");
  } catch (err) {
    console.error("❌ Seed failed:", err);
  } finally {
    process.exit(0);
  }
}

seed();