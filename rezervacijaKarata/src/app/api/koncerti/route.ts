import { NextResponse } from "next/server";
import { db } from "@/db";
import { koncerti } from "@/db/schema/koncert";

export async function GET() {
  try {
    const data = await db.query.koncerti.findMany({
      with: {
        kategorija: true,
        lokacija: true,
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: "Greška pri dohvatanju koncerata" },
      { status: 500 }
    );
  }
}