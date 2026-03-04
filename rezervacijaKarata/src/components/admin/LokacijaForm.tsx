"use client";
import { useState } from "react";

export default function LokacijaForm() {
    const [naziv, setNaziv] = useState("");
    const [mesto, setMesto] = useState("");
    const [adresa, setAdresa] = useState("");
    const [ukupanKapacitet, setUkupanKapacitet] = useState(0);
    const [regioni, setRegioni] = useState([{ naziv: "", kapacitet: 0 }]);

    const dodajRegion = () => {
        setRegioni([...regioni, { naziv: "", kapacitet: 0 }]);
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        const response = await fetch("/api/admin/lokacije", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                naziv,
                mesto,
                adresa,
                ukupanKapacitet,
                regioni
            }),
        });

        if (response.ok) {
            alert("Lokacija sačuvana!");
            // Opciono: resetuj formu ovde
        } else {
            alert("Greška pri čuvanju lokacije.");
        }

    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-gray-50 p-6 rounded-lg border">
            <h2 className="text-2xl font-bold border-b pb-2">Dodavanje Lokacije</h2>

            <div className="grid grid-cols-2 gap-4">
                <input className="p-2 border rounded" placeholder="Naziv dvorane" onChange={(e) => setNaziv(e.target.value)} required />
                <input className="p-2 border rounded" placeholder="Mesto" onChange={(e) => setMesto(e.target.value)} required />
                <input className="p-2 border rounded" placeholder="Adresa" onChange={(e) => setAdresa(e.target.value)} required />
                <input type="number" className="p-2 border rounded" placeholder="Ukupan kapacitet" onChange={(e) => setUkupanKapacitet(Number(e.target.value))} required />
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">Regioni sedenja</h3>
                    <button type="button" onClick={dodajRegion} className="text-sm bg-gray-800 text-white px-3 py-1 rounded">+ Dodaj Region</button>
                </div>

                {regioni.map((reg, index) => (
                    <div key={index} className="flex gap-4 items-center bg-white p-3 shadow-sm rounded border">
                        <input
                            className="flex-1 p-2 border rounded text-sm"
                            placeholder="Naziv regiona (npr. VIP)"
                            onChange={(e) => {
                                const novi = [...regioni];
                                novi[index].naziv = e.target.value;
                                setRegioni(novi);
                            }}
                        />
                        <input
                            type="number"
                            className="w-32 p-2 border rounded text-sm"
                            placeholder="Kapacitet"
                            onChange={(e) => {
                                const novi = [...regioni];
                                novi[index].kapacitet = Number(e.target.value);
                                setRegioni(novi);
                            }}
                        />
                    </div>
                ))}
            </div>

            <button className="w-full bg-black hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition">
                Sačuvaj sve podatke
            </button>
        </form>
    );
}