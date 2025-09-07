// /app/api/projects/route.ts
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { projectsCollection, clientsCollection } from "@/lib/collections";
import {
  ProjectCreateSchema,
  type ProjectCreate,
  type ProjectDoc,
  toProjectDTO,
} from "@/types/projects";

function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: { message, ...extra } }, { status });
}

export async function GET() {
  try {
    const projectsCol = await projectsCollection();
    const cursor = projectsCol.aggregate([
      {
        $lookup: {
          from: "clients",
          localField: "clientId",
          foreignField: "_id",
          as: "client",
        },
      },
      { $unwind: { path: "$client", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          name: 1,
          clientId: 1,
          status: 1,
          amount: 1,
          deadline: 1,
          createdAt: 1,
          updatedAt: 1,
          clientName: { $ifNull: ["$client.name", "—"] },
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
    const items = await cursor.toArray();
    const data = items.map((p) =>
      toProjectDTO(p as unknown as ProjectDoc, (p as any).clientName as string)
    );
    return NextResponse.json(data);
  } catch (err) {
    console.error("[GET /api/projects] Failed:", err);
    return jsonError("Failed to load projects", 500);
  }
}

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const parsed = ProjectCreateSchema.safeParse(raw);
    if (!parsed.success) {
      return jsonError("Invalid payload", 422, { issues: parsed.error.flatten() });
    }
    const input = parsed.data as ProjectCreate;

    // validate client
    const clientsCol = await clientsCollection();
    const clientId = new ObjectId(input.clientId);
    const client = await clientsCol.findOne({ _id: clientId });
    if (!client) return jsonError("Client not found", 404);

    // deadline check (no past date)
    const deadlineDate = new Date(input.deadline);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (isNaN(+deadlineDate)) return jsonError("Invalid deadline date", 422);
    if (deadlineDate < today) return jsonError("Deadline cannot be in the past", 422);

    const now = new Date();
    const doc: Omit<ProjectDoc, "_id"> = {
      name: input.name,
      clientId,
      status: input.status,
      amount: input.amount,     // NEW
      deadline: deadlineDate,
      createdAt: now,
      updatedAt: now,
    };

    const projectsCol = await projectsCollection();
    const ins = await projectsCol.insertOne(doc);

    // adjust client counters
    await clientsCol.updateOne(
      { _id: clientId },
      { $inc: { totalProjects: 1, totalAmount: input.amount } }
    );

    const created: ProjectDoc = { _id: ins.insertedId, ...doc };
    return NextResponse.json(toProjectDTO(created, client.name), { status: 201 });
  } catch (err) {
    console.error("[POST /api/projects] Failed:", err);
    return jsonError("Failed to create project", 500);
  }
}
