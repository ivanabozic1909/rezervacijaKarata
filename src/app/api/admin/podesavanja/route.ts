import { NextResponse } from "next/server";
import { db } from "@/db";
import { cenaKarte } from "@/db/schema/cenaKarte";
import { sql } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { datumPopusta } = await req.json();

    if (!datumPopusta) {
      return NextResponse.json({ message: "Datum je obavezan" }, { status: 400 });
    }

    const d = new Date(datumPopusta);
    if (isNaN(d.getTime())) {
      return NextResponse.json({ message: "Datum nije validan" }, { status: 400 });
    }

    // Zadatak kaže: "Datum do kada važi popust od 10%"
    // Ovom komandom ažuriramo taj datum na SVIM kartama u bazi odjednom
    await db.update(cenaKarte).set({
      datumVazenjaPopusta: d,
    });

    return NextResponse.json({ message: "Globalni datum popusta je postavljen na sve karte!" });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: "Greška: " + error.message }, { status: 500 });
  }
}