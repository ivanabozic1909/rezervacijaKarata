import { NextResponse } from "next/server";
import { db } from "@/db";
import { koncerti } from "@/db/schema/koncert";
import { regionSedenja } from "@/db/schema/regionSedenja";
import { cenaKarte } from "@/db/schema/cenaKarte";
import { eq } from "drizzle-orm";
import { redis } from "@/lib/redis";

type RegionInput = {
  naziv: string;
  cena: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      naziv,
      opis,
      datumVreme,
      lokacijaId,
      kategorijaId,
      cene,
    } = body;

    const lId = parseInt(lokacijaId);
    const kId = parseInt(kategorijaId);

    if (isNaN(lId) || isNaN(kId)) {
      return NextResponse.json(
        { message: "Lokacija ili Kategorija nisu izabrani!" },
        { status: 400 }
      );
    }

    // 1️⃣ Kreiranje koncerta
    const [noviKoncert] = await db
      .insert(koncerti)
      .values({
        naziv,
        opis: opis || "",
        datumVreme: new Date(datumVreme),
        kategorijaId: kId,
        lokacijaId: lId,
      })
      .returning();

   // 2️⃣ Dohvati postojeće regione te lokacije
const regioniLokacije = await db.query.regionSedenja.findMany({
  where: eq(regionSedenja.lokacijaId, lId),
});

// 3️⃣ Za svaki region upiši cenu
for (const region of regioniLokacije) {
  const cena = body.cene?.[region.regionSedenjaId];

  if (!cena) continue;

  await db.insert(cenaKarte).values({
    iznos: cena.toString(),
    koncertId: noviKoncert.koncertId,
    regionSedenjaId: region.regionSedenjaId,
  });
  
}
await redis.del("svi_koncerti");
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("KRITIČNA GREŠKA U API-JU:", error);
    return NextResponse.json(
      { message: error.message || "Greška pri upisu u bazu" },
      { status: 500 }
    );
  }
}