import * as amqp from "amqplib";
import { db } from "./src/db";
import { rezervacije } from "./src/db/schema/rezervacija";
import { rezervisanaMesta } from "./src/db/schema/rezervisanoMesto";
import { mesta } from "./src/db/schema/mesto";
import { promoKodovi } from "./src/db/schema/promoKod";
import { valute } from "./src/db/schema/valuta";
import { eq, inArray } from "drizzle-orm";

const QUEUE_NAME = "rezervacije";
const RABBIT_URL = process.env.RABBITMQ_URL || "amqp://rabbitmq";

function generateSifra() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generatePromoKod() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// 🔥 KONVERZIJA PREKO OPEN API
async function convertCurrency(
  amountRSD: number,
  targetCurrency: string
) {
  if (targetCurrency === "RSD") return amountRSD;

  try {
    const response = await fetch(
      `https://api.exchangerate.host/latest?base=RSD&symbols=${targetCurrency}`
    );

    const data = await response.json();
    const rate = data.rates?.[targetCurrency];

    if (!rate) {
      console.log("⚠ Kurs nije pronađen, vraćam RSD cenu");
      return amountRSD;
    }

    return amountRSD * rate;
  } catch (error) {
    console.error("❌ Greška pri dohvatu kursa, vraćam RSD cenu");
    return amountRSD;
  }
}

async function connectWithRetry() {
  try {
    const connection = await amqp.connect(RABBIT_URL);
    console.log("✅ Povezan na RabbitMQ");
    return connection;
  } catch {
    console.log("⏳ Čekam RabbitMQ...");
    await new Promise((res) => setTimeout(res, 3000));
    return connectWithRetry();
  }
}

async function startWorker() {
  const connection = await connectWithRetry();
  const channel = await connection.createChannel();

  await channel.assertQueue(QUEUE_NAME, { durable: true });
  console.log("🎧 Worker sluša queue...");

  channel.consume(QUEUE_NAME, async (msg) => {
    if (!msg) return;

    try {
      const data = JSON.parse(msg.content.toString());

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
        izabranaMesta,
        promoKod,
      } = data;

      console.log("📦 Obrada rezervacije za:", ime, prezime);

      // ==========================
      // 1️⃣ Provera zauzetosti
      // ==========================

      const vecRezervisana = await db.query.rezervisanaMesta.findMany({
        where: inArray(rezervisanaMesta.mestoId, izabranaMesta),
        with: { rezervacija: true },
      });

      const aktivna = vecRezervisana.filter(
        (r) => r.rezervacija.status === "AKTIVNA"
      );

      if (aktivna.length > 0) {
        throw new Error("Neka mesta su već rezervisana.");
      }

      // ==========================
      // 2️⃣ Računanje cene u RSD
      // ==========================

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

      let ukupnaCena = 0;
      const sada = new Date();

      for (const m of mestaPodaci) {
        const cena = Number(m.region.ceneKarata[0].iznos);
        let finalCena = cena;

        const datumPopusta =
          m.region.ceneKarata[0].datumVazenjaPopusta;

        if (datumPopusta && sada <= new Date(datumPopusta)) {
          finalCena = finalCena * 0.9;
        }

        ukupnaCena += finalCena;
      }

      // 5% promo popust
      if (promoKod) {
        const promo = await db.query.promoKodovi.findFirst({
          where: eq(promoKodovi.kod, promoKod),
        });

        if (promo && promo.status === "AKTIVAN") {
          ukupnaCena = ukupnaCena * 0.95;
        }
      }

      // ==========================
      // 3️⃣ KONVERZIJA VALUTE
      // ==========================

      const valuta = await db.query.valute.findFirst({
        where: eq(valute.valutaId, valutaId),
      });

      let finalCena = ukupnaCena;

      if (valuta && valuta.kod !== "RSD") {
        finalCena = await convertCurrency(
          ukupnaCena,
          valuta.kod
        );
      }

      // ==========================
      // 4️⃣ Kreiranje rezervacije
      // ==========================

      const sifra = generateSifra();

      const [novaRezervacija] = await db
        .insert(rezervacije)
        .values({
          datumKreiranja: new Date(),
          status: "AKTIVNA",
          sifra,
          ime,
          prezime,
          email,
          adresa,
          postanskiBroj,
          mesto,
          ukupnaCena: finalCena.toFixed(2),
          koncertId,
          valutaId,
          drzavaId,
        })
        .returning();

      // ==========================
      // 5️⃣ Upis mesta
      // ==========================

      await db.insert(rezervisanaMesta).values(
        izabranaMesta.map((mestoId: number) => ({
          rezervacijaId: novaRezervacija.rezervacijaId,
          mestoId,
        }))
      );

      // ==========================
      // 6️⃣ Update promo (ako korišćen)
      // ==========================

     if (promoKod) {
  const promo = await db.query.promoKodovi.findFirst({
    where: eq(promoKodovi.kod, promoKod),
  });

  if (promo && promo.status === "AKTIVAN") {
    await db
      .update(promoKodovi)
      .set({
        status: "ISKORISCEN",
        iskoriscenURezervacijiId:
          novaRezervacija.rezervacijaId,
      })
      .where(eq(promoKodovi.kod, promoKod));
  }
}

      // ==========================
      // 7️⃣ Novi promo kod
      // ==========================

      const noviPromoKod = generatePromoKod();

      await db.insert(promoKodovi).values({
        kod: noviPromoKod,
        status: "AKTIVAN",
        kreiranIzRezervacijeId:
          novaRezervacija.rezervacijaId,
      });

      console.log(`
------------------------------------
🎟 Rezervacija uspešna!
Šifra: ${sifra}
Cena: ${finalCena.toFixed(2)} ${valuta?.kod}
🎁 Promo kod: ${noviPromoKod}
------------------------------------
`);

      channel.ack(msg);
    } catch (err) {
      console.error("❌ Greška u obradi:", err);
      channel.nack(msg, false, false);
    }
  });
}

startWorker().catch(console.error);