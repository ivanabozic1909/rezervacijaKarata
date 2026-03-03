import * as amqp from "amqplib";
import { db } from "./src/db/index";
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
// 🔥 KONVERZIJA PREKO OPEN API (ispravljena verzija)
async function convertCurrency(
  amountRSD: number,
  targetCurrency: string
) {
  if (targetCurrency === "RSD") return amountRSD;

  try {
    const response = await fetch(
      "https://open.er-api.com/v6/latest/RSD"
    );

    if (!response.ok) {
      console.log("❌ API nije dostupan, vraćam RSD cenu");
      return amountRSD;
    }

    const data = await response.json();

    const rate = data.rates?.[targetCurrency];

    if (!rate) {
      console.log("⚠ Kurs nije pronađen, vraćam RSD cenu");
      return amountRSD;
    }

    console.log(`💱 Kurs RSD → ${targetCurrency}:`, rate);

    return amountRSD * rate;

  } catch (error) {
    console.error("❌ Greška pri dohvatu kursa:", error);
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

      console.log("📩 Primljen event:", data.event);

      // =========================================
      // ❌ OTKAZIVANJE
      // =========================================
      if (data.event === "TICKET_CANCELLED") {
        console.log(`
------------------------------------
❌ REZERVACIJA OTKAZANA
Šifra: ${data.sifra}
Email: ${data.email}
Vreme: ${data.vreme}
------------------------------------
      `);
        channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify({
          event: "OTKAZANA_KARTA",
          sifra: data.sifra
        })));
        channel.ack(msg);
        return;
      }
      if (data.event === "TICKET_UPDATED") {

        const {
          rezervacijaId,
          novaMesta,
          sifra,
          email
        } = data;

        console.log(`
------------------------------------
✏️ IZMENA REZERVACIJE
Šifra: ${sifra}
Nova mesta: ${novaMesta}
Vreme: ${data.vreme}
------------------------------------
  `);

        // 1️⃣ Provera zauzetosti
        const vecRezervisana = await db.query.rezervisanaMesta.findMany({
          where: inArray(rezervisanaMesta.mestoId, novaMesta),
          with: { rezervacija: true },
        });

        const zauzeta = vecRezervisana.filter(
          (r) =>
            r.rezervacija.status === "AKTIVNA" &&
            r.rezervacija.rezervacijaId !== rezervacijaId
        );

        if (zauzeta.length > 0) {
          throw new Error("Neka mesta su već rezervisana.");
        }

        // 2️⃣ Ponovni obračun cene (u RSD)
        const mestaPodaci = await db.query.mesta.findMany({
          where: inArray(mesta.mestoId, novaMesta),
          with: {
            region: {
              with: { ceneKarata: true },
            },
          },
        });

        let novaCena = 0;
        const sada = new Date();

        for (const m of mestaPodaci) {
          const cena = Number(m.region.ceneKarata[0].iznos);
          let tempCena = cena;

          const datumPopusta =
            m.region.ceneKarata[0].datumVazenjaPopusta;

          if (datumPopusta && sada <= new Date(datumPopusta)) {
            tempCena *= 0.9;
          }

          novaCena += tempCena;
        }

        // 🔹 UČITAJ REZERVACIJU DA VIDIMO VALUTU
        const rezervacija = await db.query.rezervacije.findFirst({
          where: eq(rezervacije.rezervacijaId, rezervacijaId),
          with: { valuta: true },
        });

        let konacnaCena = novaCena;

        // 🔹 AKO NIJE RSD → POZOVI EKSTERNI API
        if (rezervacija?.valuta?.kod !== "RSD") {
          konacnaCena = await convertCurrency(
            novaCena,
            rezervacija!.valuta!.kod
          );
        }

        // 3️⃣ Update baze
        await db.transaction(async (tx) => {

          await tx
            .delete(rezervisanaMesta)
            .where(eq(rezervisanaMesta.rezervacijaId, rezervacijaId));

          await tx.insert(rezervisanaMesta).values(
            novaMesta.map((mestoId: number) => ({
              rezervacijaId,
              mestoId,
            }))
          );

          await tx
            .update(rezervacije)
            .set({ ukupnaCena: konacnaCena.toFixed(2) })
            .where(eq(rezervacije.rezervacijaId, rezervacijaId));
        });

        console.log(`
------------------------------------
✅ REZERVACIJA IZMENJENA
Nova cena: ${konacnaCena.toFixed(2)} ${rezervacija?.valuta?.kod}
------------------------------------
  `);

        channel.ack(msg);
        return;
      }
      // =========================================
      // 🎟 KREIRANJE REZERVACIJE
      // =========================================
      if (data.event === "TICKET_CREATED") {

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

        // 1️⃣ Provera zauzetosti
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

        // 2️⃣ Računanje cene
        const mestaPodaci = await db.query.mesta.findMany({
          where: inArray(mesta.mestoId, izabranaMesta),
          with: {
            region: {
              with: { ceneKarata: true },
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
            finalCena *= 0.9;
          }

          ukupnaCena += finalCena;
        }


        // Promo popust (ako je validan — primeni, ako nije — ignoriši)
        let promoZaUpdate: string | null = null;

        if (promoKod) {
          const promo = await db.query.promoKodovi.findFirst({
            where: eq(promoKodovi.kod, promoKod),
          });

          // Samo ako postoji i AKTIVAN je
          if (promo && promo.status === "AKTIVAN") {
            ukupnaCena *= 0.95;
            promoZaUpdate = promo.kod;
          }

        }



        // 3️⃣ Konverzija
        const valuta = await db.query.valute.findFirst({
          where: eq(valute.valutaId, valutaId),
        });

        let finalCena = ukupnaCena;

        if (valuta && valuta.kod !== "RSD") {
          finalCena = await convertCurrency(ukupnaCena, valuta.kod);
        }

        // 4️⃣ Kreiranje rezervacije
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


        // 5️⃣ Upis mesta
        await db.insert(rezervisanaMesta).values(
          izabranaMesta.map((mestoId: number) => ({
            rezervacijaId: novaRezervacija.rezervacijaId,
            mestoId,
          }))
        );
        // 6️⃣ Ako je promo korišćen — označi ga kao iskorišćen
        if (promoZaUpdate) {
          await db
            .update(promoKodovi)
            .set({
              status: "ISKORISCEN",
              iskoriscenURezervacijiId: novaRezervacija.rezervacijaId,
            })
            .where(eq(promoKodovi.kod, promoZaUpdate));
        }

        // ==========================
        // 6️⃣ Generisanje novog promo koda
        // ==========================

        const noviPromoKod = generatePromoKod();

        await db.insert(promoKodovi).values({
          kod: noviPromoKod,
          status: "AKTIVAN",
          kreiranIzRezervacijeId: novaRezervacija.rezervacijaId,
        });
        console.log(`
------------------------------------
🎟 Rezervacija uspešna!
Šifra: ${sifra}
Cena: ${finalCena.toFixed(2)} ${valuta?.kod}
🎁 Novi promo kod: ${noviPromoKod}
------------------------------------
      `);

        // 🔥 SLANJE PODATAKA PORTALU ZA STATISTIKU - PROMENJEN QUEUE
        const PORTAL_QUEUE = "statistika_karata"; // Novo ime reda

        // 🔥 SLANJE PODATAKA PORTALU ZA STATISTIKU
        const portalData = {
          event: "KREIRANA_KARTA",
          koncertId: koncertId,
          nazivKoncerta: data.nazivKoncerta || `Koncert #${koncertId}`,
          brojKupljenihKarata: izabranaMesta.length,
          ukupnaZarada: finalCena.toFixed(2)
        };

        // Moramo prvo da "najavimo" ovaj novi red
        await channel.assertQueue(PORTAL_QUEUE, { durable: true });
        // Šaljemo u PORTAL_QUEUE, a ne u QUEUE_NAME
        channel.sendToQueue(PORTAL_QUEUE, Buffer.from(JSON.stringify(portalData)));

        console.log(`📊 Podaci poslati na ${PORTAL_QUEUE} za obradu.`);
      }

      channel.ack(msg);

    } catch (err) {
      console.error("❌ Greška u obradi:", err);
      channel.nack(msg, false, false);
    }
  });
}

startWorker().catch(console.error);