import { NextResponse } from "next/server";
import { db } from "@/db";
import { rezervacije } from "@/db/schema/rezervacija";
import { koncerti } from "@/db/schema/koncert";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const podaci = await db
      .select({
        rezervacijaId: rezervacije.rezervacijaId,
        ime: rezervacije.ime,
        prezime: rezervacije.prezime,
        ukupnaCena: rezervacije.ukupnaCena,
        status: rezervacije.status,
        sifra: rezervacije.sifra,
        // Ovde izvlačimo naziv umesto ID-a
        koncertNaziv: koncerti.naziv, 
      })
      .from(rezervacije)
      // Spajamo tabele preko koncert_id
      .leftJoin(koncerti, eq(rezervacije.koncertId, koncerti.koncertId));

    return NextResponse.json(podaci);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}