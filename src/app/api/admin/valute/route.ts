import { NextResponse } from "next/server";
import { db } from "@/db";
import { valute } from "@/db/schema/valuta";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request) {
  try {
    const { valutaId, aktivna } = await req.json();

    if (valutaId === undefined || aktivna === undefined) {
      return NextResponse.json({ message: "Nedostaju podaci" }, { status: 400 });
    }

    // Ažuriramo status valute u bazi
    await db
      .update(valute)
      .set({ aktivna: aktivna }) // Pretpostavljamo da imaš kolonu 'aktivna' (boolean)
      .where(eq(valute.valutaId, valutaId));

    return NextResponse.json({ message: "Valuta ažurirana!" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}