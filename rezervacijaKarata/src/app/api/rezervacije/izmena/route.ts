import { NextResponse } from "next/server";
import { db } from "@/db";
import { rezervacije } from "@/db/schema/rezervacija";
import { eq, and } from "drizzle-orm";
import { publishEvent } from "@/queue/publisher";

export async function PATCH(req: Request) {
  try {
    const { sifra, email, novaMesta } = await req.json();

    const [rez] = await db
      .select()
      .from(rezervacije)
      .where(
        and(
          eq(rezervacije.sifra, sifra),
          eq(rezervacije.email, email)
        )
      );

    if (!rez) {
      return NextResponse.json(
        { message: "Rezervacija nije pronađena." },
        { status: 404 }
      );
    }
    if (!novaMesta || novaMesta.length === 0) {
  return NextResponse.json(
    { message: "Morate izabrati bar jedno sedište." },
    { status: 400 }
  );
}

    // 🔥 ARHITEKTURA C – API NE MENJA BAZU
    await publishEvent({
      event: "TICKET_UPDATED",
      rezervacijaId: rez.rezervacijaId,
      sifra,
      email,
      novaMesta,
      vreme: new Date().toISOString()
    });

    return NextResponse.json({
      message: "Zahtev za izmenu je poslat na obradu."
    });

  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}