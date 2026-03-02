"use client";
import { useState, useEffect } from "react";

export default function KoncertForm() {
  const [lokacije, setLokacije] = useState([]);
  const [kategorije, setKategorije] = useState([]);
  const [regioni, setRegioni] = useState([
    { naziv: "VIP", kapacitet: 20, cena: 5000 },
  ]);

  const [osnovno, setOsnovno] = useState({
    naziv: "",
    opis: "",
    datumVreme: "",
    lokacijaId: "",
    kategorijaId: "",
  });

  useEffect(() => {
    fetch("/api/admin/lokacije").then(res => res.json()).then(setLokacije);
    fetch("/api/admin/kategorije").then(res => res.json()).then(setKategorije);
  }, []);

  const dodajRegion = () => {
    setRegioni([...regioni, { naziv: "", kapacitet: 50, cena: 2000 }]);
  };

  const obrisiRegion = (index: number) => {
    setRegioni(regioni.filter((_, i) => i !== index));
  };

  const azurirajRegion = (index: number, polje: string, vrednost: any) => {
    const novi = [...regioni];
    novi[index] = { ...novi[index], [polje]: vrednost };
    setRegioni(novi);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    // DEBUG: Proveri šta šalješ
    console.log("Šaljem payload:", { ...osnovno, regioni });

    const res = await fetch("/api/admin/koncerti", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...osnovno, regioni }),
    });

    if (res.ok) {
      alert("Koncert sa svim regionima je uspešno kreiran!");
      window.location.href = "/"; // Bolje nego reload da odmah vidiš Home
    } else {
      const errData = await res.json();
      alert("Greška: " + errData.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto p-6">
      <h3 className="text-2xl font-black">Novi Koncert</h3>
      
      <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl shadow-inner">
        <input 
          placeholder="Naziv koncerta" 
          className="border p-2 rounded" 
          onChange={e => setOsnovno({...osnovno, naziv: e.target.value})} 
          required 
        />
        <input 
          type="datetime-local" 
          className="border p-2 rounded" 
          onChange={e => setOsnovno({...osnovno, datumVreme: e.target.value})} 
          required 
        />
        
        {/* POPRAVLJEN SELECT ZA LOKACIJU */}
        <select 
          className="border p-2 rounded bg-white" 
          defaultValue="" 
          onChange={e => setOsnovno({...osnovno, lokacijaId: e.target.value})} 
          required
        >
          <option value="" disabled hidden>Izaberi lokaciju</option>
          {lokacije.map((l: any) => (
            <option key={l.lokacijaId} value={l.lokacijaId.toString()}>
              {l.naziv}
            </option>
          ))}
        </select>

        {/* POPRAVLJEN SELECT ZA KATEGORIJU */}
        <select 
          className="border p-2 rounded bg-white" 
          defaultValue="" 
          onChange={e => setOsnovno({...osnovno, kategorijaId: e.target.value})} 
          required
        >
          <option value="" disabled hidden>Izaberi kategoriju</option>
          {kategorije.map((k: any) => (
            <option key={k.kategorijaId} value={k.kategorijaId.toString()}>
              {k.naziv}
            </option>
          ))}
        </select>
      </div>

      <textarea 
        placeholder="Opis koncerta..." 
        className="w-full border p-2 rounded min-h-[100px]"
        onChange={e => setOsnovno({...osnovno, opis: e.target.value})}
      />

      <hr />

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-bold text-lg text-blue-600">Regioni i Cene</h4>
          <button type="button" onClick={dodajRegion} className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700">
            + Dodaj Region
          </button>
        </div>

        {regioni.map((reg, index) => (
          <div key={index} className="flex gap-2 items-end border-l-4 border-blue-500 p-3 bg-white shadow-sm rounded">
            <div className="flex-1">
              <label className="text-xs text-gray-400 block mb-1">Naziv (VIP, Parter...)</label>
              <input 
                value={reg.naziv} 
                className="w-full border p-2 rounded" 
                onChange={e => azurirajRegion(index, "naziv", e.target.value)} 
                required 
              />
            </div>
            <div className="w-24">
              <label className="text-xs text-gray-400 block mb-1">Mesta</label>
              <input 
                type="number" 
                value={reg.kapacitet} 
                className="w-full border p-2 rounded" 
                onChange={e => azurirajRegion(index, "kapacitet", e.target.value)} 
                required 
              />
            </div>
            <div className="w-32">
              <label className="text-xs text-gray-400 block mb-1">Cena (RSD)</label>
              <input 
                type="number" 
                value={reg.cena} 
                className="w-full border p-2 rounded" 
                onChange={e => azurirajRegion(index, "cena", e.target.value)} 
                required 
              />
            </div>
            {regioni.length > 1 && (
              <button type="button" onClick={() => obrisiRegion(index)} className="text-red-500 p-2 hover:bg-red-50 rounded">✕</button>
            )}
          </div>
        ))}
      </div>

      <button type="submit" className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg hover:bg-gray-800 transition shadow-lg">
        Objavi Koncert
      </button>
    </form>
  );
}