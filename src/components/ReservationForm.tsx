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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reservationCompleted, setReservationCompleted] = useState(false);

  const [promoStatus, setPromoStatus] = useState<
    "idle" | "valid" | "invalid"
  >("idle");

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
    if (zauzeto || isSubmitting || reservationCompleted) return;

    setSelectedSeats((prev) =>
      prev.includes(mestoId)
        ? prev.filter((id) => id !== mestoId)
        : [...prev, mestoId]
    );
  }

  const procenaCene = useMemo(() => {
    let total = 0;
    const sada = new Date();

    regioni.forEach((region: any) => {
      const cenaObj = region.ceneKarata?.[0];
      if (!cenaObj) return;

      let cena = Number(cenaObj.iznos);
      const datumPopusta = cenaObj.datumVazenjaPopusta;

      if (datumPopusta && new Date(datumPopusta) >= sada) {
        cena *= 0.9;
      }

      region.mesta.forEach((mesto: any) => {
        if (selectedSeats.includes(mesto.mestoId)) {
          total += cena;
        }
      });
    });

    if (promoStatus === "valid") {
      total *= 0.95;
    }

    return total.toFixed(2);
  }, [selectedSeats, regioni, promoStatus]);

  async function checkPromo() {
    if (!form.promoKod || reservationCompleted) return;

    const res = await fetch(`/api/promo/check?kod=${form.promoKod}`);
    const data = await res.json();

    setPromoStatus(data.valid ? "valid" : "invalid");
  }

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

    setIsSubmitting(true);
    setMessage("Rezervacija se obrađuje...");

    try {
      const res = await fetch("/api/rezervacije", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          koncertId,
          ...form,
          drzavaId: Number(form.drzavaId),
          valutaId: Number(form.valutaId),
          mesta: selectedSeats,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Greška.");
        setIsSubmitting(false);
        return;
      }

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
🎁 Promo kod: ${data.generisaniPromoKod}
            `);

            setIsSubmitting(false);
            setReservationCompleted(true);
          }
        }
      }, 2000);
    } catch {
      setMessage("Greška pri slanju zahteva.");
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-100 p-8 rounded-2xl space-y-6 mt-16"
    >
      <h2 className="text-2xl font-bold">Rezervacija karata</h2>

      {regioni.map((region: any) => (
        <div key={region.regionSedenjaId} className="mb-8">
          <h3 className="font-bold mb-2 text-lg">
            {region.naziv}
          </h3>
          {(() => {
  const datum = region.ceneKarata?.[0]?.datumVazenjaPopusta;
  if (!datum) return null;

  const sada = new Date();
  const aktivan = new Date(datum) >= sada;

  return (
    <p
      className={`text-sm mb-3 font-medium ${
        aktivan ? "text-green-600" : "text-gray-500"
      }`}
    >
      {aktivan
        ? `🎉 10% popust važi do ${new Date(datum).toLocaleDateString("sr-RS")}`
        : `Popust je istekao (${new Date(datum).toLocaleDateString("sr-RS")})`}
    </p>
  );
})()}


          <div className="grid grid-cols-6 gap-2">
            {region.mesta.map((mesto: any) => {
              const zauzeto =
                Array.isArray(mesto.rezervacije) &&
                mesto.rezervacije.length > 0;

              const selektovano =
                selectedSeats.includes(mesto.mestoId);

              return (
                <button
                  type="button"
                  key={mesto.mestoId}
                  disabled={
                    zauzeto ||
                    isSubmitting ||
                    reservationCompleted
                  }
                  onClick={() =>
                    toggleSeat(mesto.mestoId, zauzeto)
                  }
                  className={`p-2 rounded text-sm transition ${
                    zauzeto
                      ? "bg-red-500 text-white"
                      : selektovano
                      ? "bg-blue-600 text-white"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
                >
                  {mesto.oznaka}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="bg-white p-4 rounded shadow">
        <strong>Procena cene: {procenaCene} RSD</strong>
      </div>

      {/* Lepši inputi */}
      <input
        placeholder="Ime"
        className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-black"
        value={form.ime}
        onChange={(e) => setForm({ ...form, ime: e.target.value })}
        required
        disabled={reservationCompleted}
      />

      <input
        placeholder="Prezime"
        className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-black"
        value={form.prezime}
        onChange={(e) =>
          setForm({ ...form, prezime: e.target.value })
        }
        required
        disabled={reservationCompleted}
      />

      <input
        placeholder="Email adresa"
        className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-black"
        value={form.email}
        onChange={(e) =>
          setForm({ ...form, email: e.target.value })
        }
        required
        disabled={reservationCompleted}
      />

      <input
        placeholder="Potvrdite email adresu"
        className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-black"
        value={form.potvrdaEmail}
        onChange={(e) =>
          setForm({ ...form, potvrdaEmail: e.target.value })
        }
        required
        disabled={reservationCompleted}
      />

      <input
        placeholder="Adresa stanovanja"
        className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-black"
        value={form.adresa}
        onChange={(e) =>
          setForm({ ...form, adresa: e.target.value })
        }
        required
        disabled={reservationCompleted}
      />

      <input
        placeholder="Poštanski broj"
        className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-black"
        value={form.postanskiBroj}
        onChange={(e) =>
          setForm({ ...form, postanskiBroj: e.target.value })
        }
        required
        disabled={reservationCompleted}
      />

      <input
        placeholder="Grad / Mesto"
        className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-black"
        value={form.mesto}
        onChange={(e) =>
          setForm({ ...form, mesto: e.target.value })
        }
        required
        disabled={reservationCompleted}
      />
      <select
  className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-black"
  value={form.drzavaId}
  onChange={(e) =>
    setForm({ ...form, drzavaId: e.target.value })
  }
  required
  disabled={reservationCompleted}
>
  <option value="">Izaberite državu</option>
  {drzave.map((d: any) => (
    <option key={d.drzavaId} value={d.drzavaId}>
      {d.naziv}
    </option>
  ))}
</select>
<select
  className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-black"
  value={form.valutaId}
  onChange={(e) =>
    setForm({ ...form, valutaId: e.target.value })
  }
  required
  disabled={reservationCompleted}
>
  <option value="">Izaberite valutu</option>
  {valute.map((v: any) => (
    <option key={v.valutaId} value={v.valutaId}>
      {v.kod} - {v.naziv}
    </option>
  ))}
</select>

      <div className="flex gap-2">
        <input
          placeholder="Unesite promo kod"
          className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-black"
          value={form.promoKod}
          onChange={(e) =>
            setForm({ ...form, promoKod: e.target.value })
          }
          disabled={reservationCompleted}
        />
        <button
          type="button"
          onClick={checkPromo}
          disabled={reservationCompleted}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg"
        >
          Proveri
        </button>
      </div>
      {promoStatus === "valid" && (<p className="text-green-600 text-sm"> 
      ✔ Promo kod je validan. Popust od 5% će biti uračunat.
       </p> )}
      {promoStatus === "invalid" && ( <p className="text-red-600 text-sm">
       ✖ Promo kod nije važeći. Popust neće biti uračunat.
       </p> )}





      <button
        type="submit"
        disabled={reservationCompleted}
        className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg"
      >
        Pošalji rezervaciju
      </button>

      {message && (
        <div className="bg-white p-4 rounded shadow whitespace-pre-line">
          {message}
        </div>
      )}
    </form>
  );
}