// /app/api/_debug/db/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb"; // <-- this is a Promise<MongoClient>

export async function GET() {
  try {
    const client = await clientPromise; // ✅ await the promise (don't call it)
    const ping = await client.db().admin().ping();
    return NextResponse.json({ ok: true, ping });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "DB ping failed" },
      { status: 500 }
    );
  }
}
