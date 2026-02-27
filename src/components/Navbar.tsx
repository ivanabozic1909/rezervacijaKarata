"use client";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">
        🎟 RezervacijaKarata
      </h1>

      <div className="space-x-6">
        <a href="/admin">Admin</a>
<a href="/izmena">Izmena karte</a>
<a href="/otkazivanje">Otkazivanje</a>
      </div>
    </nav>
  );
}