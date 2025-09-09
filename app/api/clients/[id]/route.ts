// /app/api/clients/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import { clientsCollection } from "@/lib/collections";
import  authOptions  from "@/lib/auth-options";

// Use RELATIVE import if your tsconfig paths aren't picked up during build.
// If your "@/types/clients" alias works, you can switch to that path instead.
import {
  ClientUpdateSchema,
  type ClientUpdate,
  type ClientDoc,
  toClientDTO,
} from "../../../../types/clients";

/** Consistent JSON error helper */
function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: { message, ...extra } }, { status });
}

/* ------------------------------------------------------------------ */
/* GET /api/clients/[id]                                              */
/* ------------------------------------------------------------------ */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> } // Next.js 15: params is a Promise
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return jsonError("Unauthorized", 401);

    const { id } = await ctx.params;
    if (!ObjectId.isValid(id)) return jsonError("Invalid id", 400);

    const col = await clientsCollection();
    const doc = (await col.findOne({ _id: new ObjectId(id) })) as ClientDoc | null;
    if (!doc) return jsonError("Not found", 404);

    return NextResponse.json(toClientDTO(doc), { status: 200 });
  } catch (err) {
    console.error("GET /api/clients/[id] failed:", err);
    return jsonError("Failed to fetch client", 500);
  }
}

/* ------------------------------------------------------------------ */
/* PUT /api/clients/[id]                                              */
/* ------------------------------------------------------------------ */
export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> } // Next.js 15: params is a Promise
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return jsonError("Unauthorized", 401);

    const { id } = await ctx.params;
    if (!ObjectId.isValid(id)) return jsonError("Invalid id", 400);

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON body", 400);
    }

    const parsed = ClientUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation error", 422, { issues: parsed.error.flatten() });
    }
    const data = parsed.data as ClientUpdate;

    const update: Partial<ClientDoc> = {
      ...(typeof data.name === "string" ? { name: data.name.trim() } : {}),
      ...(typeof data.email === "string" ? { email: data.email.trim().toLowerCase() } : {}),
      ...(typeof data.company === "string" ? { company: data.company.trim() } : {}),
      ...(typeof data.totalProjects === "number" ? { totalProjects: data.totalProjects } : {}),
      // NOTE: do NOT set totalAmount here; it’s derived elsewhere
      updatedAt: new Date(),
    };

    const col = await clientsCollection();

    // Normalize result for MongoDB driver v5/v6
    const raw = (await col.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: "after" }
    )) as any;

    const updatedDoc: ClientDoc | null =
      raw && typeof raw === "object" && "value" in raw ? (raw.value as ClientDoc | null) : (raw as ClientDoc | null);

    if (!updatedDoc) return jsonError("Not found", 404);

    return NextResponse.json(toClientDTO(updatedDoc), { status: 200 });
  } catch (err) {
    console.error("PUT /api/clients/[id] failed:", err);
    return jsonError("Failed to update client", 500);
  }
}

/* ------------------------------------------------------------------ */
/* DELETE /api/clients/[id]                                           */
/* ------------------------------------------------------------------ */
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> } // Next.js 15: params is a Promise
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return jsonError("Unauthorized", 401);

    const { id } = await ctx.params;
    if (!ObjectId.isValid(id)) return jsonError("Invalid id", 400);

    const col = await clientsCollection();
    const res = await col.deleteOne({ _id: new ObjectId(id) });
    if (res.deletedCount === 0) return jsonError("Not found", 404);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/clients/[id] failed:", err);
    return jsonError("Failed to delete client", 500);
  }
}
