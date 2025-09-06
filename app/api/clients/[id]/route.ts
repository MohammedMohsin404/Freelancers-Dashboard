// /app/api/clients/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import { clientsCollection } from "@/lib/collections";
import { authOptions } from "@/lib/auth-options";

// Use RELATIVE import to avoid alias issues if tsconfig paths aren't picked up yet.
// If your alias works, you can switch to: import { ... } from "@/types/clients";
import {
  ClientUpdateSchema,
  type ClientUpdate,
  type ClientDoc,
  toClientDTO,
} from "../../../../types/clients";

/** Uniform error helper */
function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: { message, ...extra } }, { status });
}

/** GET /api/clients/[id] - fetch one */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
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
  } catch (err: any) {
    console.error("GET /api/clients/[id] failed:", err);
    return jsonError("Failed to fetch client", 500);
  }
}

/** PUT /api/clients/[id] - update */
export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return jsonError("Unauthorized", 401);

    const { id } = await ctx.params; // ← must await in Next.js 15
    if (!ObjectId.isValid(id)) return jsonError("Invalid id", 400);

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON body", 400);
    }

    const parsed = ClientUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation error", 422, { issues: parsed.error.issues });
    }
    const data = parsed.data as ClientUpdate;

    const update: Partial<ClientDoc> = {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.email !== undefined ? { email: data.email } : {}),
      ...(data.company !== undefined ? { company: data.company } : {}),
      ...(data.totalProjects !== undefined ? { totalProjects: data.totalProjects } : {}),
      updatedAt: new Date(),
    };

    const col = await clientsCollection();
    const res = await col.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: "after" }
    );

    if (!res.value) return jsonError("Not found", 404);

    return NextResponse.json(toClientDTO(res.value as ClientDoc), { status: 200 });
  } catch (err: any) {
    console.error("PUT /api/clients/[id] failed:", err);
    return jsonError("Failed to update client", 500);
  }
}

/** DELETE /api/clients/[id] - remove */
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return jsonError("Unauthorized", 401);

    const { id } = await ctx.params; // ← must await in Next.js 15
    if (!ObjectId.isValid(id)) return jsonError("Invalid id", 400);

    const col = await clientsCollection();
    const res = await col.deleteOne({ _id: new ObjectId(id) });
    if (res.deletedCount === 0) return jsonError("Not found", 404);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    console.error("DELETE /api/clients/[id] failed:", err);
    return jsonError("Failed to delete client", 500);
  }
}
