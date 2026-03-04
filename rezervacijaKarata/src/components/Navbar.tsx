"use client";
import Link from "next/link"; // Uvezi Link

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <Link href="/">
        <h1 className="text-xl font-bold cursor-pointer">
          🎟 RezervacijaKarata
        </h1>
      </Link>

      <div className="space-x-6">
        <Link href="/admin" className="hover:text-blue-600">Admin</Link>
        <Link href="/izmena" className="hover:text-blue-600">Izmena karte</Link>
        <Link href="/otkazivanje" className="hover:text-blue-600 font-bold text-red-600">Otkazivanje</Link>
      </div>
    </nav>
  );
}