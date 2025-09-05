import { NextResponse } from "next/server";
import getMongoClientPromise from "@/lib/mongodb";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const client = await getMongoClientPromise();
    const ping = await client.db().admin().ping();
    return NextResponse.json({ ok: true, ping });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}
