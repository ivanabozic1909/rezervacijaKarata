import { db } from "@/db";
import { statistikaKoncerti } from "@/db/schema";

export default async function PortalHome() {
  const podaci = await db.select().from(statistikaKoncerti);

  return (
    <main className="p-10 bg-gray-50 min-h-screen text-slate-900">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-black mb-2 uppercase tracking-tight">Portal za izveštavanje</h1>
        <p className="text-gray-500 mb-8 italic">Statistika prodaje karata u realnom vremenu</p>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="p-4">Naziv Koncerta</th>
                <th className="p-4 text-center">Prodato Karata</th>
                <th className="p-4 text-right">Zarada</th>
              </tr>
            </thead>
            <tbody>
              {podaci.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-10 text-center text-gray-400">
                    Nema podataka. Pokrenite kupovinu u glavnoj aplikaciji.
                  </td>
                </tr>
              ) : (
                podaci.map((k) => (
                  <tr key={k.id} className="border-b hover:bg-blue-50 transition-colors">
                    <td className="p-4 font-bold">{k.nazivKoncerta}</td>
                    <td className="p-4 text-center">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-black">
                        {k.brojKupljenihKarata}
                      </span>
                    </td>
                    <td className="p-4 text-right font-mono text-green-600">
                      {k.ukupnaZarada}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}