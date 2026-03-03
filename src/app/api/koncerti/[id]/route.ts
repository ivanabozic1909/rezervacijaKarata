import { NextResponse } from "next/server";
import { db } from "@/db";
import { koncerti } from "@/db/schema/koncert";
import { eq } from "drizzle-orm";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);

    const koncert = await db.query.koncerti.findFirst({
      where: eq(koncerti.koncertId, numericId),
      with: {
      kategorija: true,
  lokacija: true,
  ceneKarata: {
    with: {
      regionSedenja: {
        with: {
          mesta: {
            with: {
              rezervacije: true,
            },
          },
        },
      },
    },
  },
},
    });

    if (!koncert) {
      return NextResponse.json(
        { message: "Koncert nije pronađen" },
        { status: 404 }
      );
    }

    return NextResponse.json(koncert);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Greška pri dohvaćanju koncerta" },
      { status: 500 }
    );
  }
}