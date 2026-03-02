import { NextResponse } from "next/server";
import { db } from "@/db";
import { rezervacije } from "@/db/schema/rezervacija";
import { promoKodovi } from "@/db/schema/promoKod";
import { eq, and } from "drizzle-orm";
import { publishEvent } from "@/queue/publisher"; // Uvezi novu funkciju

export async function PATCH(req: Request) {
  try {
    const { sifra, email } = await req.json();

    const [rez] = await db
      .select()
      .from(rezervacije)
      .where(and(eq(rezervacije.sifra, sifra), eq(rezervacije.email, email)));

    if (!rez) return NextResponse.json({ message: "Rezervacija nije nađena" }, { status: 404 });

    await db.transaction(async (tx) => {
      await tx.update(rezervacije).set({ status: "OTKAZANO" }).where(eq(rezervacije.rezervacijaId, rez.rezervacijaId));
      await tx.update(promoKodovi).set({ status: "Neaktivan" }).where(eq(promoKodovi.kreiranIzRezervacijeId, rez.rezervacijaId));
    });

    // POZIV PUBLISHERA: Šaljemo na "rezervacije" queue da bi tvoj worker to video
    await publishEvent("rezervacije", {
      event: "OTKAZANA_KARTA",
      sifra: rez.sifra,
      email: rez.email,
      vreme: new Date().toISOString()
    });

    return NextResponse.json({ message: "Rezervacija uspešno otkazana." });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}