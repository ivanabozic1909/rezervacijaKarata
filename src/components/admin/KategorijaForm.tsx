"use client";
import { useState } from "react";

export default function KategorijaForm() {
  const [naziv, setNaziv] = useState("");
  const [opis, setOpis] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const res = await fetch("/api/admin/kategorije", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ naziv, opis }),
    });

    if (res.ok) {
      alert("Kategorija dodata!");
      setNaziv("");
      setOpis("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md bg-gray-50 p-6 rounded-lg border">
      <h2 className="text-xl font-bold">Nova Kategorija</h2>
      <input 
        className="w-full p-2 border rounded" 
        placeholder="Naziv (npr. Rock)" 
        value={naziv}
        onChange={e => setNaziv(e.target.value)} 
        required 
      />
      <textarea 
        className="w-full p-2 border rounded" 
        placeholder="Opis kategorije" 
        value={opis}
        onChange={e => setOpis(e.target.value)} 
      />
      <button className="bg-black text-white px-6 py-2 rounded font-bold">Sačuvaj</button>
    </form>
  );
}