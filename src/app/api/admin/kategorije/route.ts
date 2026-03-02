import { NextResponse } from "next/server";
import { db } from "@/db";
import { kategorije } from "@/db/schema/kategorija";

// 1. DOHVATANJE SVIH KATEGORIJA (za select polje u formi)
export async function GET() {
  try {
    const sveKategorije = await db.select().from(kategorije);
    return NextResponse.json(sveKategorije);
  } catch (error) {
    console.error("Greška pri dohvatanju kategorija:", error);
    return NextResponse.json({ message: "Greška na serveru" }, { status: 500 });
  }
}

// 2. DODAVANJE NOVE KATEGORIJE (ispunjava zahtev: "Upravljanje kategorijama")
export async function POST(req: Request) {
  try {
    const { naziv, opis } = await req.json();

    if (!naziv) {
      return NextResponse.json({ message: "Naziv je obavezan" }, { status: 400 });
    }

    const [novaKategorija] = await db.insert(kategorije).values({
      naziv,
      opis
    }).returning();

    return NextResponse.json(novaKategorija, { status: 201 });
  } catch (error) {
    console.error("Greška pri čuvanju kategorije:", error);
    return NextResponse.json({ message: "Greška na serveru" }, { status: 500 });
  }
}