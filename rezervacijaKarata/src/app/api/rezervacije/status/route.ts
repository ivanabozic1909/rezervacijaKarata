import { NextResponse } from "next/server";
import { db } from "@/db";
import { rezervacije } from "@/db/schema/rezervacija";
import { promoKodovi } from "@/db/schema/promoKod";
import { valute } from "@/db/schema/valuta";
import { eq, and,  desc} from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const email = searchParams.get("email");
  const sifra = searchParams.get("sifra");

  if (!email) {
    return NextResponse.json(
      { message: "Email je obavezan." },
      { status: 400 }
    );
  }

  let rezervacija;

  if (sifra) {
    rezervacija = await db.query.rezervacije.findFirst({
      where: and(
        eq(rezervacije.email, email),
        eq(rezervacije.sifra, sifra)
      ),
      with: { valuta: true },
    });
  } else {
    rezervacija = await db.query.rezervacije.findFirst({
      where: eq(rezervacije.email, email),
      orderBy: (rezervacije, { desc }) => [
        desc(rezervacije.datumKreiranja),
      ],
      with: { valuta: true },
    });
  }

  if (!rezervacija) {
    return NextResponse.json(
      { message: "Rezervacija još nije obrađena." },
      { status: 404 }
    );
  }
  

  const promo = await db.query.promoKodovi.findFirst({
    where: eq(
      promoKodovi.kreiranIzRezervacijeId,
      rezervacija.rezervacijaId
    ),
  });

  return NextResponse.json({
    status: rezervacija.status,
    sifra: rezervacija.sifra,
    ukupnaCena: rezervacija.ukupnaCena,
    valutaKod: rezervacija.valuta?.kod || "RSD",
    generisaniPromoKod: promo?.kod || null,
  });
}