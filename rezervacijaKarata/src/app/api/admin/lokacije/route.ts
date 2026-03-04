import { NextResponse } from "next/server";
import { db } from "@/db";
import { lokacije } from "@/db/schema/lokacija";
import { regionSedenja } from "@/db/schema/regionSedenja";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { naziv, mesto, adresa, ukupanKapacitet, regioni } = body;

        // 1. Validacija osnovnih podataka
        if (!naziv || !mesto || !adresa || !ukupanKapacitet) {
            return NextResponse.json(
                { message: "Sva polja za lokaciju su obavezna" },
                { status: 400 }
            );
        }

        // Koristimo transakciju da budemo sigurni da ako pukne upis regiona, ne upiše se ni lokacija
        return await db.transaction(async (tx) => {

            // 2. Ubacivanje lokacije u bazu
            const [novaLokacija] = await tx.insert(lokacije).values({
                naziv,
                mesto,
                adresa,
                ukupanKapacitet: Number(ukupanKapacitet),
            }).returning();

            // 3. Ubacivanje regiona ako su poslati
            if (regioni && regioni.length > 0) {
                const regioniZaInsert = regioni
                    .filter((r: any) => r.naziv.trim() !== "") // Preskačemo prazne regione
                    .map((r: any) => ({
                        naziv: r.naziv,
                        kapacitet: Number(r.kapacitet),
                        lokacijaId: novaLokacija.lokacijaId,
                        // Napomena: koncertId ovde ostaje null jer se lokacija/region definišu kao šablon, 
                        // a biće povezani sa konkretnim koncertom u sledećem koraku administracije.
                    }));

                if (regioniZaInsert.length > 0) {
                    await tx.insert(regionSedenja).values(regioniZaInsert);
                }
            }

            return NextResponse.json(
                { message: "Lokacija i regioni uspešno kreirani", lokacijaId: novaLokacija.lokacijaId },
                { status: 201 }
            );
        });

    } catch (error) {
        console.error("Greška pri kreiranju lokacije:", error);
        return NextResponse.json(
            { message: "Serverska greška pri upisu u bazu" },
            { status: 500 }
        );
    }
}

// Opciono: GET metoda ako želiš da izlistaš sve lokacije u adminu
export async function GET() {
    try {
        // 1. Dohvatamo sve lokacije
        const sveLokacije = await db.select().from(lokacije);

        // 2. Dohvatamo sve regione
        const sviRegioni = await db.select().from(regionSedenja);

        // 3. Ručno spajamo jer je to najsigurniji način da izbegnemo 500 grešku
        const data = sveLokacije.map((l) => ({
            ...l,
            regioniSedenja: sviRegioni.filter((r) => r.lokacijaId === l.lokacijaId),
        }));

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("API ERROR:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }

}