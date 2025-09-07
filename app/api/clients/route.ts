// /app/api/clients/route.ts
import { NextResponse } from "next/server";
import { clientsCollection } from "@/lib/collections";
import {
  ClientCreateSchema,
  type ClientCreate,
  type ClientDoc,
  toClientDTO,
} from "@/types/clients";

function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: { message, ...extra } }, { status });
}

export async function GET() {
  try {
    const col = await clientsCollection();
    const docs = await col.find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(docs.map(toClientDTO as any));
  } catch (e) {
    console.error("[GET /api/clients] Failed:", e);
    return jsonError("Failed to load clients", 500);
  }
}

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const parsed = ClientCreateSchema.safeParse(raw);
    if (!parsed.success) {
      return jsonError("Invalid payload", 422, { issues: parsed.error.flatten() });
    }
    const input = parsed.data as ClientCreate;

    const col = await clientsCollection();
    const now = new Date();
    const doc: Omit<ClientDoc, "_id"> = {
      name: input.name,
      email: input.email,
      company: input.company,
      totalProjects: 0,     // default
      totalAmount: 0,       // default
      createdAt: now,
      updatedAt: now,
    };
    const result = await col.insertOne(doc);
    return NextResponse.json(toClientDTO({ _id: result.insertedId, ...doc }), { status: 201 });
  } catch (e) {
    console.error("[POST /api/clients] Failed:", e);
    return jsonError("Failed to create client", 500);
  }
}
