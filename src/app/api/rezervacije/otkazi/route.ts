import { NextResponse } from "next/server";
import { db } from "@/db";
import { rezervacije } from "@/db/schema/rezervacija";
import { rezervisanaMesta } from "@/db/schema/rezervisanoMesto";
import { eq } from "drizzle-orm";

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sifra = searchParams.get("sifra");

    if (!sifra) {
      return NextResponse.json({ message: "Morate uneti šifru." }, { status: 400 });
    }

    // 1. Nađi rezervaciju po šifri
    const [rez] = await db.select().from(rezervacije).where(eq(rezervacije.sifra, sifra));

    if (!rez) {
      return NextResponse.json({ message: "Rezervacija sa tom šifrom ne postoji." }, { status: 404 });
    }

    // 2. Obriši povezana mesta
    await db.delete(rezervisanaMesta).where(eq(rezervisanaMesta.rezervacijaId, rez.rezervacijaId));

    // 3. Obriši samu rezervaciju
    await db.delete(rezervacije).where(eq(rezervacije.rezervacijaId, rez.rezervacijaId));

    return NextResponse.json({ message: "Uspešno otkazano." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Greška pri otkazivanju." }, { status: 500 });
  }
}