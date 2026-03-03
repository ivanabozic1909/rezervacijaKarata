"use client";
import { useEffect, useState } from "react";

export default function KoncertForm() {
  const [naziv, setNaziv] = useState("");
  const [opis, setOpis] = useState("");
  const [datumVreme, setDatumVreme] = useState("");
  const [lokacijaId, setLokacijaId] = useState("");
  const [kategorijaId, setKategorijaId] = useState("");

  const [lokacije, setLokacije] = useState<any[]>([]);
  const [kategorije, setKategorije] = useState<any[]>([]);
  const [regioni, setRegioni] = useState<any[]>([]);
  const [cene, setCene] = useState<Record<number, string>>({});

  const [message, setMessage] = useState("");

  // 🔹 Učitavanje lokacija i kategorija
  useEffect(() => {
    fetch("/api/admin/lokacije")
      .then(res => res.json())
      .then(setLokacije);

    fetch("/api/admin/kategorije")
      .then(res => res.json())
      .then(setKategorije);
  }, []);

  // 🔹 Kada se izabere lokacija → učitaj regione
  function handleLokacijaChange(id: string) {
  setLokacijaId(id);
  setCene({});

  if (!id) {
    setRegioni([]);
    return;
  }

  const lokacija = lokacije.find(
    l => l.lokacijaId === Number(id)
  );

  setRegioni(lokacija?.regioniSedenja || []);
}

  // 🔹 Slanje forme
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!lokacijaId || !kategorijaId) {
      setMessage("Lokacija i kategorija su obavezne.");
      return;
    }

    const res = await fetch("/api/admin/koncerti", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        naziv,
        opis,
        datumVreme,
        lokacijaId,
        kategorijaId,
        cene,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.message || "Greška.");
      return;
    }

    setMessage("Koncert uspešno kreiran!");
    setNaziv("");
    setOpis("");
    setDatumVreme("");
    setLokacijaId("");
    setKategorijaId("");
    setRegioni([]);
    setCene({});
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      <h2 className="text-2xl font-bold">Novi Koncert</h2>

      <input
        className="w-full p-3 border rounded"
        placeholder="Naziv koncerta"
        value={naziv}
        onChange={e => setNaziv(e.target.value)}
        required
      />

      <textarea
        className="w-full p-3 border rounded"
        placeholder="Opis"
        value={opis}
        onChange={e => setOpis(e.target.value)}
      />

      <input
        type="datetime-local"
        className="w-full p-3 border rounded"
        value={datumVreme}
        onChange={e => setDatumVreme(e.target.value)}
        required
      />

      {/* 🔹 Lokacija */}
      <select
        className="w-full p-3 border rounded"
        value={lokacijaId}
        onChange={e => handleLokacijaChange(e.target.value)}
        required
      >
        <option value="">Izaberi lokaciju</option>
        {lokacije.map(l => (
          <option key={l.lokacijaId} value={l.lokacijaId}>
            {l.naziv}
          </option>
        ))}
      </select>

      {/* 🔹 Kategorija */}
      <select
        className="w-full p-3 border rounded"
        value={kategorijaId}
        onChange={e => setKategorijaId(e.target.value)}
        required
      >
        <option value="">Izaberi kategoriju</option>
        {kategorije.map(k => (
          <option key={k.kategorijaId} value={k.kategorijaId}>
            {k.naziv}
          </option>
        ))}
      </select>

      {/* 🔥 Regioni sa unosom cene */}
      {regioni.length > 0 && (
        <div className="space-y-4 border p-4 rounded">
          <h3 className="font-semibold">Cene po regionima</h3>

          {regioni.map(region => (
            <div key={region.regionSedenjaId} className="flex gap-4 items-center">
              <span className="w-40">{region.naziv}</span>
              <input
                type="number"
                placeholder="Cena"
                className="p-2 border rounded w-40"
                value={cene[region.regionSedenjaId] || ""}
                onChange={(e) =>
                  setCene(prev => ({
                    ...prev,
                    [region.regionSedenjaId]: e.target.value
                  }))
                }
                required
              />
            </div>
          ))}
        </div>
      )}

      <button className="bg-black text-white px-6 py-3 rounded">
        Sačuvaj koncert
      </button>

      {message && (
        <p className="text-sm text-gray-700">{message}</p>
      )}
    </form>
  );
}