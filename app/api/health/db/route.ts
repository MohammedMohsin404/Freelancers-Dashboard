// /app/api/health/db/route.ts
import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import getMongoClientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = (await getMongoClientPromise()) as MongoClient;
    const admin = client.db().admin();
    const { ok } = await admin.ping();
    const dbName = client.db().databaseName;

    return NextResponse.json({ ok: !!ok, dbName }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "DB health check failed" },
      { status: 500 }
    );
  }
}
