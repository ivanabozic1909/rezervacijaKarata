"use client";

import ConcertCard from "./ConcertCard";

export default function ConcertGrid({ koncerti }: any) {
  if (koncerti.length === 0) {
    return <p>Nema dostupnih koncerata.</p>;
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {koncerti.map((koncert: any) => (
        <ConcertCard key={koncert.koncertId} koncert={koncert} />
      ))}
    </div>
  );
}