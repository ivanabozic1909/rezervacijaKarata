import { NextResponse } from "next/server";
import { db } from "@/db";
import { rezervacije } from "@/db/schema/rezervacija";
import { rezervisanaMesta } from "@/db/schema/rezervisanoMesto";
import { regionSedenja } from "@/db/schema/regionSedenja";
import { eq, and } from "drizzle-orm";
import { cenaKarte } from "@/db/schema/cenaKarte";

export async function POST(req: Request) {
  try {
    const { sifra, email } = await req.json();

    const rez = await db.query.rezervacije.findFirst({
      where: and(
        eq(rezervacije.sifra, sifra),
        eq(rezervacije.email, email)
      ),
    });

    if (!rez) {
      return NextResponse.json(
        { message: "Rezervacija nije pronađena." },
        { status: 404 }
      );
    }

    // ✅ KLJUČNO — PROVERA STATUSA
    if (rez.status !== "AKTIVNA") {
      return NextResponse.json(
        { message: "Rezervacija nije aktivna i ne može se izmeniti." },
        { status: 400 }
      );
    }

    const mojaMesta = await db.query.rezervisanaMesta.findMany({
      where: eq(
        rezervisanaMesta.rezervacijaId,
        rez.rezervacijaId
      ),
    });

    const cene = await db.query.cenaKarte.findMany({
  where: eq(cenaKarte.koncertId, rez.koncertId),
  with: {
    regionSedenja: {
      with: {
        mesta: {
          with: {
            rezervacije: true,
          },
        },
      },
    },
  },
});

   
    return NextResponse.json({
  rezervacijaId: rez.rezervacijaId,
  mojaMesta: mojaMesta.map((m) => m.mestoId),
  regioni: cene.map(c => ({
    ...c.regionSedenja,
    cena: c.iznos
  })),
});

  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}