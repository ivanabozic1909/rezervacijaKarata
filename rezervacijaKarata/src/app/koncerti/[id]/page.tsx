import ReservationForm from "@/components/ReservationForm";

async function getKoncert(id: string) {
  const res = await fetch(
    `http://localhost:3000/api/koncerti/${id}`,
    { cache: "no-store" }
  );

  if (!res.ok) return null;

  return res.json();
}

async function getValute() {
  const res = await fetch(
    `http://localhost:3000/api/valute`,
    { cache: "no-store" }
  );

  if (!res.ok) return [];

  return res.json();
}

async function getDrzave() {
  const res = await fetch(
    `http://localhost:3000/api/drzave`,
    { cache: "no-store" }
  );

  if (!res.ok) return [];

  return res.json();
}

export default async function KoncertDetalj({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const koncert = await getKoncert(id);
  const valute = await getValute();
  const drzave = await getDrzave();

  if (!koncert) {
    return (
      <p className="p-10 text-center text-red-500">
        Koncert nije pronađen.
      </p>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-4">
        {koncert.naziv}
      </h1>

      <p className="text-gray-600 mb-6">
        {koncert.opis}
      </p>

      <div className="mb-10 text-gray-500 space-y-1">
        <p>📍 {koncert.lokacija?.naziv}</p>
        <p>
          📅{" "}
          {new Date(
            koncert.datumVreme
          ).toLocaleDateString("sr-RS")}
        </p>
        <p className="text-blue-600">
          {koncert.kategorija?.naziv}
        </p>
      </div>

      <h2 className="text-2xl font-semibold mb-6">
        Region sedenja
      </h2>

      <div className="grid md:grid-cols-2 gap-6 mb-16">
        {koncert.regioniSedenja.map((region: any) => (
          <div
            key={region.regionSedenjaId}
            className="border p-6 rounded-xl"
          >
            <h3 className="font-bold text-lg mb-2">
              {region.naziv}
            </h3>

            <p className="text-gray-500 mb-2">
              Kapacitet: {region.kapacitet}
            </p>

            <p className="text-green-600 font-semibold">
              Cena: {region.ceneKarata?.[0]?.iznos} RSD
            </p>
          </div>
        ))}
      </div>

      <ReservationForm
        koncertId={koncert.koncertId}
        regioni={koncert.regioniSedenja}
        valute={valute}
        drzave={drzave}
      />
    </div>
  );
}