import { NextResponse } from "next/server";
import { db } from "@/db";
import { valute } from "@/db/schema/valuta";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const data = await db
      .select()
      .from(valute)
      .where(eq(valute.aktivna, true));

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: "Greška pri dohvatanju valuta" },
      { status: 500 }
    );
  }
}