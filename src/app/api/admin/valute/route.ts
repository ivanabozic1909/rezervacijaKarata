import { NextResponse } from "next/server";
import { db } from "@/db";
import { valute } from "@/db/schema/valuta";
import { eq } from "drizzle-orm";

export async function GET() {
  const data = await db.select().from(valute);
  return NextResponse.json(data);
}

export async function PATCH(req: Request) {
  try {
    const { valutaId, aktivna } = await req.json();

    const id = Number(valutaId);

    if (isNaN(id) || aktivna === undefined) {
      return NextResponse.json(
        { message: "Nevalidni podaci" },
        { status: 400 }
      );
    }

    await db
      .update(valute)
      .set({ aktivna })
      .where(eq(valute.valutaId, id));

    return NextResponse.json({ message: "Valuta ažurirana!" });

  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}