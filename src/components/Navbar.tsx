"use client";
export default function Navbar() {
  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">
        🎟 RezervacijaKarata
      </h1>

      <div className="space-x-6">
        <a href="/" className="hover:text-blue-600">
          Početna
        </a>
        <a href="/rezervacije" className="hover:text-blue-600">
          Rezervacija
        </a>
        <a href="/login" className="hover:text-blue-600">
          Login
        </a>
      </div>
    </nav>
  );
}