"use client";
import { useState, useEffect } from "react";

export default function PodesavanjaForm() {
  const [valuteList, setValuteList] = useState<any[]>([]);
  const [koncerti, setKoncerti] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [datumPopusta, setDatumPopusta] = useState("");
  const [koncertId, setKoncertId] = useState("");

  // Učitavanje podataka
  useEffect(() => {
    Promise.all([
      fetch("/api/admin/valute").then(res => res.json()),
      fetch("/api/koncerti").then(res => res.json()),
    ]).then(([valuteData, koncertiData]) => {
      setValuteList(valuteData);
      setKoncerti(koncertiData);
      setLoading(false);
    });
  }, []);

  // Toggle valuta
  const toggleValuta = async (id: number, trenutniStatus: boolean) => {
    const res = await fetch("/api/admin/valute", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ valutaId: id, aktivna: !trenutniStatus }),
    });

    if (res.ok) {
      setValuteList(valuteList.map(v =>
        v.valutaId === id ? { ...v, aktivna: !trenutniStatus } : v
      ));
    }
  };

  // 🔥 Popust po koncertu
  const azurirajPopust = async () => {
    if (!koncertId || !datumPopusta) {
      alert("Izaberite koncert i datum.");
      return;
    }

    const res = await fetch("/api/admin/podesavanja", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ koncertId, datumPopusta }),
    });

    if (res.ok) {
      alert("Popust uspešno postavljen za izabrani koncert!");
       setKoncertId("");
    setDatumPopusta("");
    } else {
      alert("Greška pri ažuriranju.");
    }
  };

  if (loading) return <p>Učitavanje...</p>;

  return (
    <div className="space-y-8">

      {/* POPUST PO KONCERTU */}
      <section className="bg-white p-6 rounded-xl border">
        <h2 className="text-xl font-bold mb-4 text-red-600">
          Popust 10% po koncertu
        </h2>

        <div className="flex flex-col gap-4">

          <select
            className="p-2 border rounded"
            value={koncertId}
            onChange={(e) => setKoncertId(e.target.value)}
          >
            <option value="">Izaberite koncert</option>
            {koncerti.map(k => (
              <option key={k.koncertId} value={k.koncertId}>
                {k.naziv}
              </option>
            ))}
          </select>

          <input
            type="datetime-local"
            className="p-2 border rounded"
            value={datumPopusta}
            onChange={(e) => setDatumPopusta(e.target.value)}
          />

          <button
            onClick={azurirajPopust}
            className="bg-black text-white px-6 py-2 rounded-lg font-bold"
          >
            Postavi popust
          </button>
        </div>
      </section>

      {/* VALUTE */}
      <section className="bg-white p-6 rounded-xl border">
        <h2 className="text-xl font-bold mb-4">
          Dozvoljene valute
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {valuteList.map((v) => (
            <label
              key={v.valutaId}
              className="flex items-center justify-between p-4 border rounded-xl"
            >
              <div>
                <div className="font-bold">{v.kod}</div>
                <div className="text-xs text-gray-400">{v.naziv}</div>
              </div>

              <input
                type="checkbox"
                checked={v.aktivna || false}
                onChange={() =>
                  toggleValuta(v.valutaId, v.aktivna)
                }
              />
            </label>
          ))}
        </div>
      </section>

    </div>
  );
}