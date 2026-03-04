"use client";
import { useState, useEffect } from "react";

export default function PodesavanjaForm() {
    const [valuteList, setValuteList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [datumPopusta, setDatumPopusta] = useState("");

    // 1. Učitaj valute iz baze
    useEffect(() => {
        fetch("/api/valute") // Koristimo tvoj postojeći GET api/valute
            .then((res) => res.json())
            .then((data) => {
                setValuteList(data);
                setLoading(false);
            });
    }, []);

    // 2. Funkcija za promenu statusa valute
    const toggleValuta = async (id: number, trenutniStatus: boolean) => {
        const res = await fetch("/api/admin/valute", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ valutaId: id, aktivna: !trenutniStatus }),
        });

        if (res.ok) {
            // Lokalno ažuriramo UI
            setValuteList(valuteList.map(v =>
                v.valutaId === id ? { ...v, aktivna: !trenutniStatus } : v
            ));
        } else {
            alert("Greška pri čuvanju valute.");
        }
    };

    const azurirajGlobalniPopust = async () => {
        const res = await fetch("/api/admin/podesavanja", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ datumPopusta }),
        });

        if (res.ok) {
            alert("Uspešno! Sve karte su sada na popustu do izabranog datuma.");
        } else {
            alert("Greška pri ažuriranju datuma.");
        }
    };

    if (loading) return <p>Učitavanje podešavanja...</p>;

    return (
        <div className="space-y-8">
            <section className="bg-white p-6 rounded-xl border">
                <h2 className="text-xl font-bold mb-4 text-red-600">Globalni Popust 10%</h2>
                <p className="text-sm text-gray-600 mb-4">
                    Ova opcija će postaviti isti datum isteka popusta za sve koncerte u sistemu.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="datetime-local"
                        className="p-2 border rounded shadow-sm focus:ring-2 focus:ring-black"
                        value={datumPopusta}
                        onChange={(e) => setDatumPopusta(e.target.value)}
                    />
                    <button
                        onClick={azurirajGlobalniPopust}
                        className="bg-black text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-800 transition"
                    >
                        Ažuriraj sve karte
                    </button>
                </div>
            </section>

            <section className="bg-white p-6 rounded-xl border shadow-sm">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="p-2 bg-green-100 text-green-700 rounded-lg text-sm">€ $</span>
                    Dozvoljene valute za plaćanje
                </h2>
                <p className="text-sm text-gray-500 mb-6">Izaberi koje valute će kupci moći da koriste prilikom rezervacije:</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {valuteList.map((v) => (
                        <label
                            key={v.valutaId}
                            className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition ${v.aktivna ? 'border-black bg-gray-50' : 'border-gray-200'}`}
                        >
                            <div className="flex flex-col">
                                <span className="font-bold text-lg">{v.kod}</span>
                                <span className="text-xs text-gray-400">{v.naziv}</span>
                            </div>
                            <input
                                type="checkbox"
                                className="w-5 h-5 accent-black"
                                checked={v.aktivna || false}
                                onChange={() => toggleValuta(v.valutaId, v.aktivna)}
                            />
                        </label>
                    ))}
                </div>
            </section>

        </div>
    );
}