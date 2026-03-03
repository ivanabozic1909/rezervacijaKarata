import { NextResponse } from "next/server";
import { db } from "@/db";
import { koncerti } from "@/db/schema/koncert";
import { redis } from "@/lib/redis";

export async function GET() {
  const cacheKey = "svi_koncerti";

  try {
    // 1️⃣ Provera cache-a
    const cached = await redis.get(cacheKey);

    if (cached) {
      console.log("⚡ Podaci vraćeni iz CACHE-a");
      return NextResponse.json(JSON.parse(cached));
    }

    console.log("📦 Podaci vraćeni iz BAZE");

    const data = await db.query.koncerti.findMany({
      with: {
        kategorija: true,
        lokacija: true,
      },
    });

    // 2️⃣ Upis u cache (60 sekundi)
    await redis.set(cacheKey, JSON.stringify(data), {
      EX: 60,
    });

    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json(
      { message: "Greška pri dohvatanju koncerata" },
      { status: 500 }
    );
  }
}