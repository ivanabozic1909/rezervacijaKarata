import { NextResponse } from "next/server";
import { db } from "@/db";
import { lokacije } from "@/db/schema/lokacija";
import { regionSedenja } from "@/db/schema/regionSedenja";
import { mesta } from "@/db/schema/mesto";



export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { naziv, mesto, adresa, regioni } = body;

    if (!naziv || !mesto || !adresa) {
      return NextResponse.json(
        { message: "Sva polja su obavezna" },
        { status: 400 }
      );
    }

    if (!regioni || regioni.length === 0) {
      return NextResponse.json(
        { message: "Morate definisati bar jedan region" },
        { status: 400 }
      );
    }

    // 🔥 RAČUNANJE UKUPNOG KAPACITETA
    const ukupanKapacitet = regioni.reduce(
      (acc: number, r: any) => acc + Number(r.kapacitet),
      0
    );

    return await db.transaction(async (tx) => {

      const [novaLokacija] = await tx.insert(lokacije).values({
        naziv,
        mesto,
        adresa,
        ukupanKapacitet,   // 🔥 AUTO IZRAČUNATO
      }).returning();

      for (const r of regioni) {

        const [noviRegion] = await tx.insert(regionSedenja).values({
          naziv: r.naziv,
          kapacitet: Number(r.kapacitet),
          lokacijaId: novaLokacija.lokacijaId,
        }).returning();

        // generisanje mesta
        const nizMesta = [];

        for (let i = 1; i <= Number(r.kapacitet); i++) {
          nizMesta.push({
            oznaka: `${r.naziv.substring(0,2).toUpperCase()}${i}`,
            regionSedenjaId: noviRegion.regionSedenjaId,
          });
        }

        if (nizMesta.length > 0) {
          await tx.insert(mesta).values(nizMesta);
        }
      }

      return NextResponse.json({
        message: "Lokacija uspešno kreirana",
        lokacijaId: novaLokacija.lokacijaId,
      });

    });

  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

// Opciono: GET metoda ako želiš da izlistaš sve lokacije u adminu
export async function GET() {
    try {
        // 1. Dohvatamo sve lokacije
        const sveLokacije = await db.select().from(lokacije);

        // 2. Dohvatamo sve regione
        const sviRegioni = await db.select().from(regionSedenja);

        // 3. Ručno spajamo jer je to najsigurniji način da izbegnemo 500 grešku
        const data = sveLokacije.map((l) => ({
            ...l,
            regioniSedenja: sviRegioni.filter((r) => r.lokacijaId === l.lokacijaId),
        }));

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("API ERROR:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }

}