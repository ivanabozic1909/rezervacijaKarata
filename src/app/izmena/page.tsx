"use client";

import { useState } from "react";

export default function IzmenaForm() {
  const [step, setStep] = useState(1);
  const [sifra, setSifra] = useState("");
  const [email, setEmail] = useState("");
  const [regioni, setRegioni] = useState<any[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [rezervacijaId, setRezervacijaId] = useState<number | null>(null);

  // ========================
  // LOGIN – DOHVAT REZERVACIJE
  // ========================
  async function handleLogin(e: any) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/rezervacije/find", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sifra, email }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(data.message);
      return;
    }

    setRegioni(data.regioni);
    setSelectedSeats(data.mojaMesta);
    setRezervacijaId(data.rezervacijaId);
    setStep(2);
  }

  // ========================
  // TOGGLE SEDIŠTA
  // ========================
  function toggleSeat(mestoId: number, zauzeto: boolean) {
    const selektovano = selectedSeats.includes(mestoId);

    // Ako je moje (plavo) → ukloni ga
    if (selektovano) {
      setSelectedSeats(prev =>
        prev.filter(id => id !== mestoId)
      );
      return;
    }

    // Ako je tuđe (crveno) → zabrani klik
    if (zauzeto) return;

    // Ako je slobodno → dodaj
    setSelectedSeats(prev => [...prev, mestoId]);
  }

  // ========================
  // UPDATE REZERVACIJE
  // ========================
  async function handleUpdate() {
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/rezervacije/izmena", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sifra,
        email,
        novaMesta: selectedSeats,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      setMessage(data.message || "Greška pri izmeni.");
      return;
    }

    setMessage("Izmena se obrađuje...");

    const interval = setInterval(async () => {
      const response = await fetch(
        `/api/rezervacije/status?sifra=${sifra}&email=${email}`
      );

      if (response.ok) {
        const statusData = await response.json();

        if (statusData.status === "AKTIVNA") {
          clearInterval(interval);
          setLoading(false);

          setMessage(`
✅ Rezervacija uspešno izmenjena!
💰 Nova cena: ${statusData.ukupnaCena} ${statusData.valutaKod}
          `);
        }
      }
    }, 2000);
  }

  // ========================
  // STEP 1 – LOGIN
  // ========================
  if (step === 1) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <form
          onSubmit={handleLogin}
          className="bg-white p-10 rounded-2xl shadow-xl w-[420px] space-y-6"
        >
          <h2 className="text-2xl font-bold text-center">
            Izmena rezervacije
          </h2>

          <input
            placeholder="Šifra rezervacije"
            className="w-full p-4 border rounded-lg text-lg"
            value={sifra}
            onChange={(e) => setSifra(e.target.value)}
            required
          />

          <input
            placeholder="Email"
            className="w-full p-4 border rounded-lg text-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
          >
            {loading ? "Učitavanje..." : "Prikaži rezervaciju"}
          </button>

          {message && (
            <p className="text-center text-red-600">{message}</p>
          )}
        </form>
      </div>
    );
  }

  // ========================
  // STEP 2 – SEDIŠTA
  // ========================
  return (
    <div className="p-10">
      <h2 className="text-2xl font-bold mb-6">
        Izmenite svoja mesta
      </h2>

      {regioni.map((region: any) => (
        <div key={region.regionSedenjaId} className="mb-8">
          <h3 className="font-semibold mb-3 text-lg">
            {region.naziv}
          </h3>

          <div className="grid grid-cols-6 gap-2">
            {region.mesta.map((mesto: any) => {

              const rezervacije = Array.isArray(mesto.rezervacije)
                ? mesto.rezervacije
                : [];

              const selektovano =
                selectedSeats.includes(mesto.mestoId);

              // 🔥 KLJUČNO: zauzeto je samo ako postoji
              // rezervacija koja NIJE moja
              const zauzeto = rezervacije.some(
                (r: any) =>
                  r.rezervacijaId !== rezervacijaId
              );

              let boja = "bg-green-500 hover:bg-green-600";

              if (zauzeto)
                boja = "bg-red-500 cursor-not-allowed";

              if (selektovano)
                boja = "bg-blue-600";

              return (
                <button
                  key={mesto.mestoId}
                  type="button"
                  disabled={zauzeto}
                  onClick={() =>
                    toggleSeat(mesto.mestoId, zauzeto)
                  }
                  className={`${boja} text-white p-2 rounded transition`}
                >
                  {mesto.oznaka}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={handleUpdate}
        disabled={loading}
        className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition"
      >
        {loading ? "Obrada..." : "Izmeni rezervaciju"}
      </button>

      {message && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg whitespace-pre-line">
          {message}
        </div>
      )}
    </div>
  );
}