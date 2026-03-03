"use client";
import { useState } from "react";

export default function LokacijaForm() {
  const [naziv, setNaziv] = useState("");
  const [mesto, setMesto] = useState("");
  const [adresa, setAdresa] = useState("");
  

  const [regioni, setRegioni] = useState([
    { naziv: "", kapacitet: "" },
  ]);

  const [message, setMessage] = useState("");

  const dodajRegion = () => {
    setRegioni([...regioni, { naziv: "", kapacitet: ""}]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    // 🔹 Validacija zbir kapaciteta
    const zbirRegiona = regioni.reduce(
      (acc, r) => acc + Number(r.kapacitet),
      0
    );

    
    const response = await fetch("/api/admin/lokacije", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        naziv,
        mesto,
        adresa,
        
        regioni,
      }),
    });

    if (response.ok) {
      setMessage("Lokacija uspešno sačuvana!");
      setNaziv("");
      setMesto("");
      setAdresa("");
      
      setRegioni([{ naziv: "", kapacitet: ""}]);
    } else {
      setMessage("Greška pri čuvanju lokacije.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-2xl bg-gray-50 p-6 rounded-lg border"
    >
      <h2 className="text-2xl font-bold border-b pb-2">
        Dodavanje Lokacije
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <input
          className="p-2 border rounded"
          placeholder="Naziv dvorane"
          value={naziv}
          onChange={(e) => setNaziv(e.target.value)}
          required
        />

        <input
          className="p-2 border rounded"
          placeholder="Mesto"
          value={mesto}
          onChange={(e) => setMesto(e.target.value)}
          required
        />

        <input
          className="p-2 border rounded"
          placeholder="Adresa"
          value={adresa}
          onChange={(e) => setAdresa(e.target.value)}
          required
        />

    
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">
            Regioni sedenja
          </h3>

          <button
            type="button"
            onClick={dodajRegion}
            className="text-sm bg-gray-800 text-white px-3 py-1 rounded"
          >
            + Dodaj Region
          </button>
        </div>

        {regioni.map((reg, index) => (
          <div
            key={index}
            className="flex gap-4 items-center bg-white p-3 shadow-sm rounded border"
          >
            <input
              className="flex-1 p-2 border rounded text-sm"
              placeholder="Naziv regiona (npr. VIP)"
              value={reg.naziv}
              onChange={(e) => {
                const novi = [...regioni];
                novi[index].naziv = e.target.value;
                setRegioni(novi);
              }}
              required
            />

            <input
              type="number"
              className="w-32 p-2 border rounded text-sm"
              placeholder="Kapacitet"
              value={reg.kapacitet}
              onChange={(e) => {
                const novi = [...regioni];
                novi[index].kapacitet = e.target.value;
                setRegioni(novi);
              }}
              required
            />
          </div>
        ))}
      </div>

      <button className="w-full bg-black hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition">
        Sačuvaj sve podatke
      </button>

      {message && (
        <p className="text-sm text-gray-700">{message}</p>
      )}
    </form>
  );
}