import { NextResponse } from "next/server";
import { publishEvent } from "@/queue/publisher";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      koncertId,
      ime,
      prezime,
      email,
      adresa,
      postanskiBroj,
      mesto,
      drzavaId,
      valutaId,
      mesta: izabranaMesta,
      promoKod,
    } = body;

    if (!izabranaMesta || izabranaMesta.length === 0) {
      return NextResponse.json(
        { message: "Morate izabrati bar jedno mesto." },
        { status: 400 }
      );
    }

    if (!ime || !prezime || !email || !drzavaId || !valutaId || !koncertId) {
      return NextResponse.json(
        { message: "Sva obavezna polja moraju biti popunjena." },
        { status: 400 }
      );
    }

    await publishEvent( {
      event: "TICKET_CREATED",
      koncertId: Number(koncertId),
      ime,
      prezime,
      email,
      adresa,
      postanskiBroj,
      mesto,
      drzavaId: Number(drzavaId),
      valutaId: Number(valutaId),
      izabranaMesta,
      promoKod,
      vreme: new Date().toISOString()
    });

    return NextResponse.json({
      message: "Rezervacija je poslata na obradu.",
    });

  } catch (error) {
    console.error("Greška:", error);

    return NextResponse.json(
      { message: "Greška pri slanju rezervacije." },
      { status: 500 }
    );
  }
}