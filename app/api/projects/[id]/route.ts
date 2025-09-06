// /app/api/projects/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { projectsCollection } from "@/lib/collections";
import { ObjectId } from "mongodb";
import { ProjectUpdateSchema, toDTO } from "@/types/projects";
import type { ProjectDoc } from "@/types/projects";

function jsonError(message: string, status = 400, extra?: any) {
  return NextResponse.json({ error: { message, ...extra } }, { status });
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return jsonError("Unauthorized", 401);

    const { id } = params;
    if (!ObjectId.isValid(id)) return jsonError("Invalid id", 400);

    const col = await projectsCollection();
    const doc = await col.findOne({ _id: new ObjectId(id), userKey: session.user.email });
    if (!doc) return jsonError("Not found", 404);

    return NextResponse.json(toDTO(doc as ProjectDoc));
  } catch (e: any) {
    console.error("GET /api/projects/:id error:", e);
    return jsonError("Internal server error", 500);
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return jsonError("Unauthorized", 401);

    const { id } = params;
    if (!ObjectId.isValid(id)) return jsonError("Invalid id", 400);

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON body", 400);
    }

    const parsed = ProjectUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation error", 422, { issues: parsed.error.flatten() });
    }

    const update: any = { updatedAt: new Date() };
    if (parsed.data.name !== undefined) update.name = parsed.data.name;
    if (parsed.data.client !== undefined) update.client = parsed.data.client;
    if (parsed.data.status !== undefined) update.status = parsed.data.status;
    if (parsed.data.deadline !== undefined) update.deadline = new Date(parsed.data.deadline);

    const col = await projectsCollection();
    const res = await col.findOneAndUpdate(
      { _id: new ObjectId(id), userKey: session.user.email },
      { $set: update },
      { returnDocument: "after" }
    );

    if (!res) return jsonError("Not found", 404);
    return NextResponse.json(toDTO(res as unknown as ProjectDoc));
  } catch (e: any) {
    console.error("PUT /api/projects/:id error:", e);
    return jsonError("Internal server error", 500);
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return jsonError("Unauthorized", 401);

    const { id } = params;
    if (!ObjectId.isValid(id)) return jsonError("Invalid id", 400);

    const col = await projectsCollection();
    const res = await col.deleteOne({ _id: new ObjectId(id), userKey: session.user.email });
    if (res.deletedCount === 0) return jsonError("Not found", 404);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("DELETE /api/projects/:id error:", e);
    return jsonError("Internal server error", 500);
  }
}
