"use client";
import { useState } from "react";

export default function OtkazivanjeForm() {
  const [podaci, setPodaci] = useState({ sifra: "", email: "" });

  // Ovde koristimo tip direktno da izbegnemo deprecated warning
  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    
    const res = await fetch("/api/rezervacije/otkazi", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(podaci),
    });

    const data = await res.json();
    alert(data.message);
    if (res.ok) window.location.href = "/";
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-xl border mt-10">
      <h2 className="text-2xl font-black mb-4">Otkazivanje Rezervacije</h2>
      <p className="text-gray-500 text-sm mb-6">Unesite podatke da biste otkazali kartu. Karta će ostati zabeležena u istoriji, ali više neće važiti.</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          placeholder="Email" 
          type="email"
          className="w-full p-3 border rounded-lg"
          onChange={e => setPodaci({...podaci, email: e.target.value})}
          required 
        />
        <input 
          placeholder="Šifra rezervacije" 
          className="w-full p-3 border rounded-lg font-mono"
          onChange={e => setPodaci({...podaci, sifra: e.target.value})}
          required 
        />
        <button className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition">
          Potvrdi Otkazivanje
        </button>
      </form>
    </div>
  );
}