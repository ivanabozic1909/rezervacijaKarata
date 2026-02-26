import { db } from "@/db";
import Hero from "@/components/Hero";
import ConcertGrid from "@/components/ConcertGrid";

export const revalidate = 60; // keširanje 60 sekundi

export default async function HomePage() {
  const koncerti = await db.query.koncerti.findMany({
    with: {
      lokacija: true,
      kategorija: true,
    },
  });

  return (
    <main>
      <Hero />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold mb-8">
          Dostupni koncerti
        </h2>
        <ConcertGrid koncerti={koncerti} />
      </div>
    </main>
  );
}