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
    console.log("🌱 Pokrećem seed...");

   
    // =====================
    // DRŽAVE
    // =====================
    await db.insert(drzave).values([
      { naziv: "Srbija" },
      { naziv: "Hrvatska" },
      { naziv: "Bosna i Hercegovina" },
      { naziv: "Crna Gora" },
      { naziv: "Slovenija" },
      { naziv: "Nemačka" },
    ]);

    console.log("✅ Države unete");

    // =====================
    // VALUTE
    // =====================
    await db.insert(valute).values([
    {
      kod: "RSD",
      naziv: "Srpski dinar",
      aktivna: false,
    },
    {
      kod: "EUR",
      naziv: "Evro",
      aktivna: false,
    },
    {
      kod: "USD",
      naziv: "Američki dolar",
      aktivna: false,
    },
    {
      kod: "CHF",
      naziv: "Švajcarski franak",
      aktivna: false,
    },
  ]);

    console.log("✅ Valute unete");

    console.log("🎉 Seed uspešno završen");
    process.exit(0);

  } catch (error) {
    console.error("❌ Greška u seed-u:", error);
    process.exit(1);
  }
}

seed();