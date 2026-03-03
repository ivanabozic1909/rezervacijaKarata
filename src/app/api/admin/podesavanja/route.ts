import { NextResponse } from "next/server";
import { db } from "@/db";
import { cenaKarte } from "@/db/schema/cenaKarte";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { datumPopusta, koncertId } = await req.json();

    if (!datumPopusta || !koncertId) {
      return NextResponse.json(
        { message: "Datum i koncert su obavezni." },
        { status: 400 }
      );
    }

    const d = new Date(datumPopusta);

    if (isNaN(d.getTime())) {
      return NextResponse.json(
        { message: "Datum nije validan." },
        { status: 400 }
      );
    }

    await db
      .update(cenaKarte)
      .set({ datumVazenjaPopusta: d })
      .where(eq(cenaKarte.koncertId, Number(koncertId)));

    return NextResponse.json({
      message: "Popust je uspešno postavljen za izabrani koncert."
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { message: "Greška: " + error.message },
      { status: 500 }
    );
  }
}