// /app/api/health/db/route.ts
import { NextResponse } from "next/server";
import type { MongoClient } from "mongodb";
// default export from lib/mongodb is a Promise<MongoClient>
import getMongoClientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    // ❌ don't call it: getMongoClientPromise()
    // ✅ just await the promise:
    const client = (await getMongoClientPromise) as MongoClient;

    const db = client.db(process.env.MONGODB_DB || "freelancers-dashboard");
    const admin = db.admin();
    const { ok } = await admin.ping();

    return NextResponse.json({
      ok: Boolean(ok),
      database: db.databaseName,
    });
  } catch (e: any) {
    console.error("[/api/health/db] failed:", e);
    return NextResponse.json(
      { ok: false, error: e?.message || "DB health check failed" },
      { status: 500 }
    );
  }
}
