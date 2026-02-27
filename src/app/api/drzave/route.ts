import { NextResponse } from "next/server";
import { db } from "@/db";
import { drzave } from "@/db/schema/drzava";

export async function GET() {
  try {
    const data = await db.select().from(drzave);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: "Greška pri dohvatanju država" },
      { status: 500 }
    );
  }
}
