"use client";
import { useState } from "react";

export default function KategorijaForm() {
  const [naziv, setNaziv] = useState("");
  const [opis, setOpis] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/kategorije", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ naziv, opis }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Greška pri dodavanju.");
        setLoading(false);
        return;
      }

      setMessage("Kategorija uspešno dodata!");
      setNaziv("");
      setOpis("");
    } catch {
      setMessage("Serverska greška.");
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-md bg-gray-50 p-6 rounded-lg border"
    >
      <h2 className="text-xl font-bold">Nova Kategorija</h2>

      <input
        className="w-full p-2 border rounded"
        placeholder="Naziv (npr. Rock)"
        value={naziv}
        onChange={(e) => setNaziv(e.target.value)}
        required
      />

      <textarea
        className="w-full p-2 border rounded"
        placeholder="Opis kategorije"
        value={opis}
        onChange={(e) => setOpis(e.target.value)}
      />

      <button
        disabled={loading}
        className="bg-black text-white px-6 py-2 rounded font-bold disabled:opacity-50"
      >
        {loading ? "Čuvanje..." : "Sačuvaj"}
      </button>

      {message && (
        <p className="text-sm text-gray-700">{message}</p>
      )}
    </form>
  );
}