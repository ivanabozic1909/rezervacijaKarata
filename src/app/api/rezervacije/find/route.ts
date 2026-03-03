import { NextResponse } from "next/server";
import { db } from "@/db";
import { rezervacije } from "@/db/schema/rezervacija";
import { rezervisanaMesta } from "@/db/schema/rezervisanoMesto";
import { regionSedenja } from "@/db/schema/regionSedenja";
import { eq, and } from "drizzle-orm";

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

    const regioni = await db.query.regionSedenja.findMany({
      where: eq(regionSedenja.koncertId, rez.koncertId),
      with: {
        mesta: {
          with: {
            rezervacije: true,
          },
        },
      },
    });

    return NextResponse.json({
      rezervacijaId: rez.rezervacijaId,
      mojaMesta: mojaMesta.map((m) => m.mestoId),
      regioni,
    });

  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}