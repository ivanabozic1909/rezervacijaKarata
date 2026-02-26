"use client";

import { useState, useMemo } from "react";

export default function ReservationForm({
  koncertId,
  regioni,
}: any) {
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    ime: "",
    prezime: "",
    email: "",
    adresa: "",
    brojTelefona: "",
    drzavaId: 1,
    valutaId: 1,
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

  // ==========================
  // 💰 IZRAČUN UKUPNE CENE
  // ==========================

  const ukupnaCena = useMemo(() => {
    let total = 0;
    const sada = new Date();

    regioni.forEach((region: any) => {
      const cenaObj = region.ceneKarata?.[0];
      if (!cenaObj) return;

      const osnovnaCena = Number(cenaObj.iznos);
      const datumPopusta = cenaObj.datumVazenjaPopusta;

      region.mesta.forEach((mesto: any) => {
        if (selectedSeats.includes(mesto.mestoId)) {
          let finalCena = osnovnaCena;

          // 10% popust do datuma
          if (
            datumPopusta &&
            sada <= new Date(datumPopusta)
          ) {
            finalCena = finalCena * 0.9;
          }

          total += finalCena;
        }
      });
    });

    // 5% promo preview
    if (form.promoKod.trim() !== "") {
      total = total * 0.95;
    }

    return total.toFixed(2);
  }, [selectedSeats, form.promoKod, regioni]);

  async function handleSubmit(e: any) {
    e.preventDefault();

    if (selectedSeats.length === 0) {
      setMessage("Morate izabrati bar jedno mesto.");
      return;
    }

    const res = await fetch("/api/rezervacije", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        koncertId,
        ...form,
        mesta: selectedSeats,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage(
        `Uspešno! Cena: ${data.cena} | Šifra: ${data.sifra}`
      );
      setSelectedSeats([]);
    } else {
      setMessage(data.message);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-100 p-8 rounded-2xl space-y-6 mt-16"
    >
      <h2 className="text-2xl font-bold">
        Izaberite mesta
      </h2>

      {/* REGIONI */}
      {regioni.map((region: any) => (
        <div key={region.regionSedenjaId} className="mb-8">
          <h3 className="font-bold mb-4 text-lg">
            {region.naziv}
          </h3>

          <div className="grid grid-cols-6 gap-2">
            {region.mesta.map((mesto: any) => {
              const zauzeto =
                mesto.rezervacije.length > 0;

              const selektovano =
                selectedSeats.includes(mesto.mestoId);

              return (
                <button
                  type="button"
                  key={mesto.mestoId}
                  disabled={zauzeto}
                  onClick={() =>
                    toggleSeat(
                      mesto.mestoId,
                      zauzeto
                    )
                  }
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

      {/* 💰 PRIKAZ UKUPNE CENE */}
      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-lg font-semibold">
          Ukupna cena:{" "}
          <span className="text-green-600">
            {ukupnaCena} RSD
          </span>
        </p>
      </div>

      {/* PODACI */}
      {["ime", "prezime", "email", "adresa", "brojTelefona"].map(
        (field) => (
          <input
            key={field}
            placeholder={field}
            className="w-full p-3 rounded-lg border"
            value={(form as any)[field]}
            onChange={(e) =>
              setForm({
                ...form,
                [field]: e.target.value,
              })
            }
            required
          />
        )
      )}

      {/* PROMO */}
      <input
        placeholder="Promo kod (opciono)"
        className="w-full p-3 rounded-lg border"
        value={form.promoKod}
        onChange={(e) =>
          setForm({
            ...form,
            promoKod: e.target.value,
          })
        }
      />

      <button
        type="submit"
        className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"
      >
        Potvrdi rezervaciju
      </button>

      {message && (
        <div className="bg-white p-4 rounded-lg shadow mt-4">
          {message}
        </div>
      )}
    </form>
  );
}