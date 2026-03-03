import { NextResponse } from "next/server";
import { db } from "@/db";
import { promoKodovi } from "@/db/schema/promoKod";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const kod = searchParams.get("kod");

  if (!kod) {
    return NextResponse.json({ valid: false });
  }

  const promo = await db.query.promoKodovi.findFirst({
    where: eq(promoKodovi.kod, kod),
  });

  if (promo && promo.status === "AKTIVAN") {
    return NextResponse.json({ valid: true });
  }

  return NextResponse.json({ valid: false });
}