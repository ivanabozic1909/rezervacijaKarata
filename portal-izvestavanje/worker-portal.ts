import * as amqp from "amqplib";
import { db } from "./src/db/index"; 
import { statistikaKoncerti } from "./src/db/schema"; 
import { eq, sql } from "drizzle-orm";

const QUEUE_NAME = "statistika_karata";
const RABBIT_URL = process.env.RABBITMQ_URL || "amqp://localhost";

async function startPortalWorker() {
  try {
    const connection = await amqp.connect(RABBIT_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    console.log("📊 Portal Worker: Slušam RabbitMQ za statistiku...");

    channel.consume(QUEUE_NAME, async (msg) => {
      if (!msg) return;
      
      try {
        const content = msg.content.toString();
        const data = JSON.parse(content);

        // Kada stigne nova karta
        if (data.event === "KREIRANA_KARTA") {
           await db.insert(statistikaKoncerti)
            .values({
              koncertId: data.koncertId,
              nazivKoncerta: data.nazivKoncerta,
              brojKupljenihKarata: data.brojKupljenihKarata || 1,
              ukupnaZarada: data.ukupnaZarada || "0"
            })
            .onConflictDoUpdate({
              target: statistikaKoncerti.koncertId,
              set: { 
                brojKupljenihKarata: sql`${statistikaKoncerti.brojKupljenihKarata} + ${data.brojKupljenihKarata || 1}`,
                ukupnaZarada: sql`${statistikaKoncerti.ukupnaZarada} + ${data.ukupnaZarada || 0}`,
                poslednjaIzmena: new Date()
              }
            });
           console.log(`📈 Statistika ažurirana: ${data.nazivKoncerta} (+${data.ukupnaZarada} RSD)`);
        }

        if (data.event === "OTKAZANA_KARTA") {
          console.log(`📉 Otkazivanje detektovano za šifru: ${data.sifra}`);
        }

        channel.ack(msg);
      } catch (err) {
        console.error("❌ Greška u obradi statistike:", err);
        // Opciono: channel.nack(msg, false, false) ako želiš da odbiješ poruku bez ponavljanja
      }
    });
  } catch (error) {
    console.error("❌ Portal Worker nije uspeo da se poveže:", error);
  }
}

startPortalWorker();