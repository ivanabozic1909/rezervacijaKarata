import { NextResponse } from "next/server";
import { db } from "@/db";
import { rezervacije } from "@/db/schema/rezervacija";
import { rezervisanaMesta } from "@/db/schema/rezervisanoMesto";
import { mesta } from "@/db/schema/mesto";
import { cenaKarte } from "@/db/schema/cenaKarte";
import { promoKodovi } from "@/db/schema/promoKod";
import { eq, inArray } from "drizzle-orm";

function generateSifra() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      koncertId,
      ime,
      prezime,
      email,
      adresa,
      brojTelefona,
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

    // =====================================================
    // 1️⃣ Provera da li su mesta već rezervisana (AKTIVNO)
    // =====================================================

    const vecRezervisana = await db.query.rezervisanaMesta.findMany({
      where: inArray(rezervisanaMesta.mestoId, izabranaMesta),
      with: {
        rezervacija: true,
      },
    });

    const aktivnaRezervisana = vecRezervisana.filter(
      (r) => r.rezervacija.jeAktivna === true
    );

    if (aktivnaRezervisana.length > 0) {
      return NextResponse.json(
        { message: "Neka mesta su već rezervisana." },
        { status: 400 }
      );
    }

    // =====================================================
    // 2️⃣ Dohvati mesta + cenu
    // =====================================================

    const mestaPodaci = await db.query.mesta.findMany({
      where: inArray(mesta.mestoId, izabranaMesta),
      with: {
        region: {
          with: {
            ceneKarata: true,
          },
        },
      },
    });

    if (mestaPodaci.length !== izabranaMesta.length) {
      return NextResponse.json(
        { message: "Neispravna mesta." },
        { status: 400 }
      );
    }

    // =====================================================
    // 3️⃣ Računanje cene + 10% popust
    // =====================================================

    let ukupnaCena = 0;
    const sada = new Date();

    for (const m of mestaPodaci) {
      const cena = Number(m.region.ceneKarata[0].iznos);
      let finalCena = cena;

      const datumPopusta =
        m.region.ceneKarata[0].datumVazenjaPopusta;

      if (datumPopusta && sada <= new Date(datumPopusta)) {
        finalCena = finalCena * 0.9; // 10% popust
      }

      ukupnaCena += finalCena;
    }

    // =====================================================
    // 4️⃣ Promo kod 5%
    // =====================================================

    if (promoKod) {
      const promo = await db.query.promoKodovi.findFirst({
        where: eq(promoKodovi.kod, promoKod),
      });

      if (promo) {
        ukupnaCena = ukupnaCena * 0.95; // 5% popust
      }
    }

    // =====================================================
    // 5️⃣ Kreiranje rezervacije
    // =====================================================

    const [novaRezervacija] = await db
      .insert(rezervacije)
      .values({
        datumKreiranja: new Date(),
        jeAktivna: true,
        sifra: generateSifra(),

        ime,
        prezime,
        email,
        adresa,
        brojTelefona,

        ukupnaCena: ukupnaCena.toString(),

        koncertId,
        valutaId,
        drzavaId,
      })
      .returning();

    // =====================================================
    // 6️⃣ Upis rezervisanih mesta
    // =====================================================

    await db.insert(rezervisanaMesta).values(
      izabranaMesta.map((mestoId: number) => ({
        rezervacijaId: novaRezervacija.rezervacijaId,
        mestoId,
      }))
    );

    return NextResponse.json({
      message: "Uspešna rezervacija!",
      cena: ukupnaCena,
      sifra: novaRezervacija.sifra,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Greška pri rezervaciji." },
      { status: 500 }
    );
  }
}