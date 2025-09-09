// /app/api/projects/route.ts
import { NextResponse } from "next/server";
import {
  ObjectId,
  type Collection,
  type InsertOneResult,
} from "mongodb";
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

/**
 * DB shape for projects.
 * NOTE: `_id` is optional here so insertOne(doc) is valid.
 * `clientId` is an ObjectId in the database.
 */
type ProjectDocDB = {
  _id?: ObjectId;
  name: string;
  clientId: ObjectId;
  status: ProjectDoc["status"];
  amount: number;
  deadline: Date;
  createdAt: Date;
  updatedAt: Date;
};

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

    // Validate clientId
    if (!input.clientId || !ObjectId.isValid(input.clientId)) {
      return jsonError("Invalid clientId", 422);
    }
    const clientId = new ObjectId(input.clientId);

    // Client must exist
    const clientsCol = await clientsCollection();
    const client = await clientsCol.findOne({ _id: clientId });
    if (!client) return jsonError("Client not found", 404);

    // Validate & normalize deadline (no past dates)
    const deadlineDate = new Date(input.deadline);
    if (Number.isNaN(deadlineDate.valueOf())) {
      return jsonError("Invalid deadline date", 422);
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (deadlineDate < today) {
      return jsonError("Deadline cannot be in the past", 422);
    }

    // Validate amount
    const amount = Number(input.amount);
    if (!Number.isFinite(amount) || amount < 0) {
      return jsonError("Amount must be a non-negative number", 422);
    }

    const now = new Date();

    // Build DB doc with optional _id
    const doc: ProjectDocDB = {
      name: input.name.trim(),
      clientId,
      status: input.status,
      amount,
      deadline: deadlineDate,
      createdAt: now,
      updatedAt: now,
    };

    // Cast the shared collection to the DB-shaped collection for insert/read
    const projectsColGeneric = await projectsCollection();
    const projectsColDB = projectsColGeneric as unknown as Collection<ProjectDocDB>;

    const ins: InsertOneResult<ProjectDocDB> = await projectsColDB.insertOne(doc);

    // Update client counters (best-effort)
    await clientsCol.updateOne(
      { _id: clientId },
      {
        $inc: { totalProjects: 1, totalAmount: amount } as any,
        $set: { updatedAt: new Date() },
      }
    );

    const created = await projectsColDB.findOne({ _id: ins.insertedId });
    if (!created) {
      return jsonError("Create succeeded but project not found", 500);
    }

    // Convert DB doc to DTO. We already know the client's name.
    return NextResponse.json(
      toProjectDTO(created as unknown as ProjectDoc, (client as any).name),
      { status: 201 }
    );
  } catch (err) {
    if ((err as any)?.code === 11000) {
      return jsonError("Project already exists (duplicate key)", 409, {
        key: (err as any)?.keyValue,
      });
    }
    console.error("[POST /api/projects] Failed:", err);
    return jsonError("Failed to create project", 500);
  }
}
