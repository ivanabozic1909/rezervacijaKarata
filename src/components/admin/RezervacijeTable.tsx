"use client";
import { useEffect, useState } from "react";

export default function RezervacijeTable() {
  const [rezervacije, setRezervacije] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/rezervacije")
      .then((res) => res.json())
      .then((data) => {
        setRezervacije(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Učitavanje rezervacija...</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 text-xs uppercase text-gray-500">
            <th className="p-4 border-b">Šifra</th>
            <th className="p-4 border-b">Ime i Prezime</th>
            <th className="p-4 border-b">Koncert</th>
            <th className="p-4 border-b">Iznos</th>
            <th className="p-4 border-b">Status</th>
          </tr>
        </thead>
        <tbody>
          {rezervacije.length === 0 ? (
            <tr><td colSpan={5} className="p-10 text-center text-gray-400">Nema rezervacija.</td></tr>
          ) : (
            rezervacije.map((r) => (
              <tr key={r.rezervacijaId} className="border-b hover:bg-gray-50">
                <td className="p-4 font-mono">{r.sifra}</td>
                <td className="p-4 font-bold">{r.ime} {r.prezime}</td>
                <td className="p-4">{r.koncertNaziv || "Nepoznat koncert"}</td>
                <td className="p-4">{r.ukupnaCena} RSD</td>
                <td className="p-4">
                   <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase">
                    {r.status}
                   </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}