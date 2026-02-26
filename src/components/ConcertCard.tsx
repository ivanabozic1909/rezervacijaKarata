"use client";
import Link from "next/link"

export default function ConcertCard({ koncert }: any) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition">
      <h3 className="text-xl font-bold mb-2">
        {koncert.naziv}
      </h3>

      <p className="text-gray-600 mb-4">
        {koncert.opis}
      </p>

      <div className="text-sm text-gray-500 space-y-1">
        <p>📍 {koncert.lokacija.naziv}</p>
        <p>
          📅{" "}
          {new Date(
            koncert.datumVreme
          ).toLocaleDateString("sr-RS")}
        </p>
        <p className="text-blue-600">
          {koncert.kategorija.naziv}
        </p>
      </div>

     
<Link
  href={`/koncerti/${koncert.koncertId}`}
  className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
>
  Detalji
</Link>
    </div>
  );
}