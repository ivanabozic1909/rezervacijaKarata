"use client";

import { useState, useMemo } from "react";

export default function ReservationForm({
  koncertId,
  regioni,
  valute,
  drzave,
}: any) {
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    ime: "",
    prezime: "",
    email: "",
    potvrdaEmail: "",
    adresa: "",
    postanskiBroj: "",
    mesto: "",
    drzavaId: "",
    valutaId: "",
    promoKod: "",
  });

  function toggleSeat(mestoId: number, zauzeto: boolean) {
    if (zauzeto) return;

    setSelectedSeats((prev) =>
      prev.includes(mestoId)
        ? prev.filter((id) => id !== mestoId)
        : [...prev, mestoId]
    );
  }

  // 🔎 Procena cene (samo preview)
  const procenaCene = useMemo(() => {
    let total = 0;

    regioni.forEach((region: any) => {
      const cenaObj = region.ceneKarata?.[0];
      if (!cenaObj) return;

      const osnovnaCena = Number(cenaObj.iznos);

      region.mesta.forEach((mesto: any) => {
        if (selectedSeats.includes(mesto.mestoId)) {
          total += osnovnaCena;
        }
      });
    });

    return total.toFixed(2);
  }, [selectedSeats, regioni]);

  async function handleSubmit(e: any) {
    e.preventDefault();

    if (selectedSeats.length === 0) {
      setMessage("Morate izabrati bar jedno mesto.");
      return;
    }

    if (form.email !== form.potvrdaEmail) {
      setMessage("Email adrese se ne poklapaju.");
      return;
    }

    if (!form.drzavaId || !form.valutaId) {
      setMessage("Morate izabrati državu i valutu.");
      return;
    }

    const res = await fetch("/api/rezervacije", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        koncertId,
        ime: form.ime,
        prezime: form.prezime,
        email: form.email,
        adresa: form.adresa,
        postanskiBroj: form.postanskiBroj,
        mesto: form.mesto,
        drzavaId: Number(form.drzavaId),
        valutaId: Number(form.valutaId),
        promoKod: form.promoKod,
        mesta: selectedSeats,
      }),
    });

    const data = await res.json();
if (res.ok) {
  setMessage("Rezervacija se obrađuje...");

  const interval = setInterval(async () => {
    const response = await fetch(
      `/api/rezervacije/status?email=${form.email}`
    );

    if (response.ok) {
      const data = await response.json();

      if (data.status === "AKTIVNA") {
        clearInterval(interval);

        setMessage(`
🎟 Rezervacija uspešna!
Šifra: ${data.sifra}
Ukupna cena: ${data.ukupnaCena} ${data.valutaKod}
🎁 Promo kod za sledeću kupovinu: ${data.generisaniPromoKod}
        `);
      }
    }
  }, 2000);
} else {
      setMessage(data.message || "Došlo je do greške.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-100 p-8 rounded-2xl space-y-6 mt-16"
    >
      <h2 className="text-2xl font-bold">Rezervacija karata</h2>

      {/* REGIONI */}
      {regioni.map((region: any) => (
        <div key={region.regionSedenjaId} className="mb-8">
          <h3 className="font-bold mb-4 text-lg">{region.naziv}</h3>

          <div className="grid grid-cols-6 gap-2">
            {region.mesta.map((mesto: any) => {
              const zauzeto = mesto.rezervacije.length > 0;
              const selektovano = selectedSeats.includes(mesto.mestoId);

              return (
                <button
                  type="button"
                  key={mesto.mestoId}
                  disabled={zauzeto}
                  onClick={() => toggleSeat(mesto.mestoId, zauzeto)}
                  className={`
                    p-2 rounded text-sm transition
                    ${
                      zauzeto
                        ? "bg-red-500 cursor-not-allowed text-white"
                        : selektovano
                        ? "bg-blue-600 text-white"
                        : "bg-green-500 hover:bg-green-600 text-white"
                    }
                  `}
                >
                  {mesto.oznaka}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* PROCENA CENE */}
      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-lg font-semibold">
          Procena cene:{" "}
          <span className="text-green-600">
            {procenaCene} RSD
          </span>
        </p>
        <p className="text-sm text-gray-500">
          Konačna cena se obračunava u backend sistemu.
        </p>
      </div>

      {/* OSNOVNI PODACI */}
      {[
        { name: "ime", placeholder: "Ime" },
        { name: "prezime", placeholder: "Prezime" },
        { name: "email", placeholder: "Email" },
        { name: "potvrdaEmail", placeholder: "Potvrda email adrese" },
        { name: "adresa", placeholder: "Adresa" },
        { name: "postanskiBroj", placeholder: "Poštanski broj" },
        { name: "mesto", placeholder: "Mesto" },
      ].map((field) => (
        <input
          key={field.name}
          placeholder={field.placeholder}
          className="w-full p-3 rounded-lg border"
          value={(form as any)[field.name]}
          onChange={(e) =>
            setForm({
              ...form,
              [field.name]: e.target.value,
            })
          }
          required
        />
      ))}

      {/* DRŽAVA */}
      <select
        className="w-full p-3 rounded-lg border"
        value={form.drzavaId}
        onChange={(e) =>
          setForm({ ...form, drzavaId: e.target.value })
        }
        required
      >
        <option value="">Izaberite državu</option>
        {drzave?.map((drzava: any) => (
          <option key={drzava.drzavaId} value={drzava.drzavaId}>
            {drzava.naziv}
          </option>
        ))}
      </select>

      {/* VALUTA */}
      <select
        className="w-full p-3 rounded-lg border"
        value={form.valutaId}
        onChange={(e) =>
          setForm({ ...form, valutaId: e.target.value })
        }
        required
      >
        <option value="">Izaberite valutu</option>
        {valute?.map((valuta: any) => (
          <option key={valuta.valutaId} value={valuta.valutaId}>
            {valuta.kod} - {valuta.naziv}
          </option>
        ))}
      </select>

      {/* PROMO */}
      <input
        placeholder="Promo kod (opciono)"
        className="w-full p-3 rounded-lg border"
        value={form.promoKod}
        onChange={(e) =>
          setForm({ ...form, promoKod: e.target.value })
        }
      />

      <button
        type="submit"
        className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"
      >
        Pošalji rezervaciju
      </button>

      {message && (
        <div className="bg-white p-4 rounded-lg shadow mt-4">
          {message}
        </div>
      )}
    </form>
  );
}