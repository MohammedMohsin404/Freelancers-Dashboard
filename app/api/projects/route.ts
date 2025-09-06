// /app/api/projects/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { projectsCollection } from "@/lib/collections";
import { ProjectCreateSchema, toDTO } from "@/types/projects";
import type { ProjectDoc } from "@/types/projects";

function jsonError(message: string, status = 400, extra?: any) {
  return NextResponse.json({ error: { message, ...extra } }, { status });
}

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return jsonError("Unauthorized", 401);

    const col = await projectsCollection();
    const docs = await col
      .find({ userKey: session.user.email })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(docs.map(toDTO));
  } catch (e: any) {
    console.error("GET /api/projects error:", e);
    return jsonError("Internal server error", 500);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return jsonError("Unauthorized", 401);

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON body", 400);
    }

    const parsed = ProjectCreateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation error", 422, { issues: parsed.error.flatten() });
    }

    const now = new Date();
    const doc: Omit<ProjectDoc, "_id"> = {
      userKey: session.user.email,
      name: parsed.data.name,
      client: parsed.data.client,
      status: parsed.data.status,
      deadline: new Date(parsed.data.deadline),
      createdAt: now,
      updatedAt: now,
    };

    const col = await projectsCollection();
    const res = await col.insertOne(doc as ProjectDoc);
    const created = await col.findOne({ _id: res.insertedId });

    return NextResponse.json(toDTO(created as ProjectDoc), { status: 201 });
  } catch (e: any) {
    console.error("POST /api/projects error:", e);
    return jsonError("Internal server error", 500);
  }
}
