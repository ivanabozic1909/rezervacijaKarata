import { db } from "@/db";
import { koncerti } from "@/db/schema/koncert";
import { lokacije } from "@/db/schema/lokacija";
import { kategorije } from "@/db/schema/kategorija";
import { eq } from "drizzle-orm";
import Hero from "@/components/Hero";
import ConcertGrid from "@/components/ConcertGrid";

export const revalidate = 60;

export default async function HomePage() {
  try {
    // Ručno spajamo tabele da bismo izbegli "lateral join" grešku
    const podaci = await db
      .select({
        koncertId: koncerti.koncertId,
        naziv: koncerti.naziv,
        opis: koncerti.opis,
        datumVreme: koncerti.datumVreme,
        // Mapiramo lokaciju i kategoriju onako kako ConcertCard očekuje
        lokacija: {
          naziv: lokacije.naziv,
          mesto: lokacije.mesto,
        },
        kategorija: {
          naziv: kategorije.naziv,
        },
      })
      .from(koncerti)
      .leftJoin(lokacije, eq(koncerti.lokacijaId, lokacije.lokacijaId))
      .leftJoin(kategorije, eq(koncerti.kategorijaId, kategorije.kategorijaId));

    return (
      <main>
        <Hero />
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h2 className="text-3xl font-bold mb-8">Dostupni koncerti</h2>
          <ConcertGrid koncerti={podaci} />
        </div>
      </main>
    );
  } catch (error) {
    console.error("Baza podataka nije dostupna:", error);
    return <div className="p-20 text-center">Greška pri učitavanju koncerata. Proverite bazu.</div>;
  }
}