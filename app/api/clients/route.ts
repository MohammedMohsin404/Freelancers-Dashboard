// /app/api/clients/route.ts
import { NextResponse } from "next/server";
import { clientsCollection } from "@/lib/collections";
import {
  ClientCreateSchema,
  type ClientCreate,
  type ClientDoc,
  toClientDTO,
} from "@/types/clients";

/** Consistent JSON error helper */
function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: { message, ...extra } }, { status });
}

/**
 * GET /api/clients
 * Returns all clients ordered by newest first.
 */
export async function GET() {
  try {
    const col = await clientsCollection();
    const docs = await col.find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(docs.map((d) => toClientDTO(d as ClientDoc)));
  } catch (e) {
    console.error("[GET /api/clients] Failed:", e);
    return jsonError("Failed to load clients", 500);
  }
}

/**
 * POST /api/clients
 * Create a new client.
 * - Validates payload via zod
 * - Normalizes/trim input
 * - Checks for duplicates (email OR same name+company)
 * - Initializes totals to 0 (only totalProjects is stored; total amount is derived from Projects)
 */
export async function POST(req: Request) {
  try {
    const raw = await req.json();

    const parsed = ClientCreateSchema.safeParse(raw);
    if (!parsed.success) {
      return jsonError("Invalid payload", 422, {
        issues: parsed.error.flatten(),
      });
    }

    const input = parsed.data as ClientCreate;

    // Normalize/trim
    const name = input.name.trim();
    const company = input.company.trim();
    const email = input.email.trim().toLowerCase();

    if (!name || !company || !email) {
      return jsonError("Name, company, and email are required", 422);
    }

    const col = await clientsCollection();

    // Prevent duplicates (email OR same name+company)
    const existing = await col.findOne({
      $or: [{ email }, { name, company }],
    });

    if (existing) {
      return jsonError("Client already exists", 409, {
        conflictOn:
          existing.email?.toLowerCase() === email ? "email" : "name_company",
      });
    }

    const now = new Date();
    // NOTE: no totalAmount here — it’s derived from projects in the UI
    const doc: Omit<ClientDoc, "_id"> = {
      name,
      email,            // stored lowercase
      company,
      totalProjects: 0, // default
      createdAt: now,
      updatedAt: now,
    };

    const result = await col.insertOne(doc as any); // Mongo expects _id at runtime; TS is fine with Omit for the payload
    return NextResponse.json(
      toClientDTO({ _id: result.insertedId, ...doc } as ClientDoc),
      { status: 201 }
    );
  } catch (e: any) {
    if (e?.code === 11000) {
      return jsonError("Client already exists (duplicate key)", 409, {
        key: e?.keyValue,
      });
    }
    console.error("[POST /api/clients] Failed:", e);
    return jsonError("Failed to create client", 500);
  }
}
