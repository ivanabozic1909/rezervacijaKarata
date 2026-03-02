import { NextResponse } from "next/server";
import { db } from "@/db";
import { koncerti } from "@/db/schema/koncert";
import { regionSedenja } from "@/db/schema/regionSedenja"; 
import { cenaKarte } from "@/db/schema/cenaKarte";       
import { mesta } from "@/db/schema/mesto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Primljeni podaci na serveru:", body); // Ovo gledaj u VS Code terminalu

    const { naziv, opis, datumVreme, lokacijaId, kategorijaId, regioni } = body;

    // Provera da li su ID-jevi validni brojevi
    const lId = parseInt(lokacijaId);
    const kId = parseInt(kategorijaId);

    if (isNaN(lId) || isNaN(kId)) {
      return NextResponse.json({ message: "Lokacija ili Kategorija nisu izabrani!" }, { status: 400 });
    }

    // 1. Unos koncerta
    const [noviKoncert] = await db.insert(koncerti).values({
      naziv,
      opis: opis || "",
      datumVreme: new Date(datumVreme),
      kategorijaId: kId,
      lokacijaId: lId,
    }).returning({ id: koncerti.koncertId });

    console.log("Koncert kreiran, ID:", noviKoncert.id);

    // 2. Regioni
    for (const reg of regioni) {
      const [noviRegion] = await db.insert(regionSedenja).values({
        naziv: reg.naziv,
        kapacitet: parseInt(reg.kapacitet),
        koncertId: noviKoncert.id,
        lokacijaId: lId,
      }).returning({ id: regionSedenja.regionSedenjaId });

      // 3. Cena
      await db.insert(cenaKarte).values({
        iznos: reg.cena.toString(), 
        regionSedenjaId: noviRegion.id,
      });

      // 4. Mesta (u manjim grupama da ne opteretimo bazu)
      const nizMesta = [];
      for (let i = 1; i <= parseInt(reg.kapacitet); i++) {
        nizMesta.push({
          oznaka: `${reg.naziv.substring(0, 2).toUpperCase()}${i}`, 
          regionSedenjaId: noviRegion.id,
        });
      }
      
      if (nizMesta.length > 0) {
        await db.insert(mesta).values(nizMesta);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("KRITIČNA GREŠKA U API-JU:", error); // OVO JE NAJVAŽNIJI ISPIS
    return NextResponse.json({ message: error.message || "Greška pri upisu u bazu" }, { status: 500 });
  }
}