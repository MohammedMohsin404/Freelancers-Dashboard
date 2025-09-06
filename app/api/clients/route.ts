// /app/api/clients/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { clientsCollection } from "@/lib/collections";
import { authOptions } from "@/lib/auth-options";

// Use RELATIVE path to avoid alias resolution issues at build time
import {
  ClientCreateSchema,
  type ClientCreate,
  type ClientDoc,
  toClientDTO,
} from "../../../types/clients";

/** Standard error helper */
function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: { message, ...extra } }, { status });
}

/** GET /api/clients — list clients */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return jsonError("Unauthorized", 401);
    }

    const col = await clientsCollection();
    const docs = (await col.find({}).sort({ updatedAt: -1 }).toArray()) as ClientDoc[];

    return NextResponse.json(docs.map(toClientDTO), { status: 200 });
  } catch (err: any) {
    console.error("GET /api/clients failed:", err);
    return jsonError("Failed to fetch clients", 500);
  }
}

/** POST /api/clients — create client */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return jsonError("Unauthorized", 401);
    }

    const body = await req.json();
    const parsed = ClientCreateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation error", 422, { issues: parsed.error.issues });
    }
    const data = parsed.data as ClientCreate;

    const now = new Date();
    const col = await clientsCollection();
    const insertResult = await col.insertOne({
      name: data.name,
      email: data.email,
      company: data.company,
      totalProjects: data.totalProjects ?? 0,
      createdAt: now,
      updatedAt: now,
    } as unknown as ClientDoc);

    const inserted = await col.findOne({ _id: insertResult.insertedId });
    if (!inserted) return jsonError("Insert failed", 500);

    return NextResponse.json(toClientDTO(inserted), { status: 201 });
  } catch (err: any) {
    console.error("POST /api/clients failed:", err);
    return jsonError("Failed to create client", 500);
  }
}
