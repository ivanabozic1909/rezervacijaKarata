import { db } from "@/db";
import Hero from "@/components/Hero";
import ConcertGrid from "@/components/ConcertGrid";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  try {
   const cacheKey = "svi_koncerti";

  let data;

  const cached = await redis.get(cacheKey);

  if (cached) {
    console.log("⚡ CACHE");
    data = JSON.parse(cached);
  } else {
    console.log("📦 BAZA");

    data = await db.query.koncerti.findMany({
      with: {
        kategorija: true,
        lokacija: true,
      },
    });

    await redis.set(cacheKey, JSON.stringify(data), { EX: 60 });}

    // 🔥 Grupisanje po kategoriji
    const grupisani = data.reduce((acc: any, koncert: any) => {
      const nazivKategorije =
        koncert.kategorija?.naziv || "Ostalo";

      if (!acc[nazivKategorije]) {
        acc[nazivKategorije] = [];
      }

      acc[nazivKategorije].push(koncert);
      return acc;
    }, {});

    return (
      <main>
        <Hero />

        <div className="max-w-6xl mx-auto px-6 py-12 space-y-16">
          {Object.entries(grupisani).map(
            ([kategorija, koncerti]: any) => (
              <div key={kategorija}>
                <h2 className="text-3xl font-bold mb-8">
                  {kategorija}
                </h2>

                <ConcertGrid koncerti={koncerti} />
              </div>
            )
          )}
        </div>
      </main>
    );
  } catch (error) {
    console.error("Baza nije dostupna:", error);
    return (
      <div className="p-20 text-center">
        Greška pri učitavanju koncerata. Proverite bazu.
      </div>
    );
  }
}