// /app/api/projects/[id]/route.ts
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { projectsCollection, clientsCollection } from "@/lib/collections";
import {
  ProjectUpdateSchema,
  type ProjectUpdate,
  type ProjectDoc,
  toProjectDTO,
} from "@/types/projects";

function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: { message, ...extra } }, { status });
}

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    if (!ObjectId.isValid(id)) return jsonError("Invalid id", 400);

    const raw = await req.json();
    const parsed = ProjectUpdateSchema.safeParse(raw);
    if (!parsed.success) {
      return jsonError("Invalid payload", 422, { issues: parsed.error.flatten() });
    }
    const input = parsed.data as ProjectUpdate;

    const projectsCol = await projectsCollection();
    const clientsCol = await clientsCollection();

    const project = await projectsCol.findOne({ _id: new ObjectId(id) });
    if (!project) return jsonError("Project not found", 404);

    const update: Partial<ProjectDoc> = { updatedAt: new Date() };

    // Track adjustments for counters
    let moveClientFrom: ObjectId | null = null;
    let moveClientTo: ObjectId | null = null;
    let amountDeltaForOldClient = 0;
    let amountDeltaForNewClient = 0;

    // Client move?
    if (input.clientId) {
      const newClientId = new ObjectId(input.clientId);
      if (!project.clientId.equals(newClientId)) {
        const newClient = await clientsCol.findOne({ _id: newClientId });
        if (!newClient) return jsonError("New client not found", 404);
        moveClientFrom = project.clientId;
        moveClientTo = newClientId;
        update.clientId = newClientId;
      }
    }

    // Amount change?
    if (typeof input.amount === "number") {
      update.amount = input.amount;
      const diff = input.amount - project.amount;
      // If no client move, apply diff to current client
      if (!moveClientFrom && !moveClientTo) {
        amountDeltaForOldClient = diff;
      } else {
        // If moving, remove full old amount from old client, add new amount to new client
        amountDeltaForOldClient = -project.amount;
        amountDeltaForNewClient = input.amount;
      }
    } else if (moveClientFrom && moveClientTo) {
      // moving but amount unchanged
      amountDeltaForOldClient = -project.amount;
      amountDeltaForNewClient = project.amount;
    }

    if (input.name !== undefined) update.name = input.name;
    if (input.status !== undefined) update.status = input.status;

    if (input.deadline !== undefined) {
      const deadlineDate = new Date(input.deadline);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (isNaN(+deadlineDate)) return jsonError("Invalid deadline date", 422);
      if (deadlineDate < today) return jsonError("Deadline cannot be in the past", 422);
      update.deadline = deadlineDate;
    }

    await projectsCol.updateOne({ _id: project._id }, { $set: update });

    // Apply counters
    if (moveClientFrom && moveClientTo) {
      await clientsCol.updateOne(
        { _id: moveClientFrom },
        { $inc: { totalProjects: -1, totalAmount: amountDeltaForOldClient } }
      );
      await clientsCol.updateOne(
        { _id: moveClientTo },
        { $inc: { totalProjects: 1, totalAmount: amountDeltaForNewClient } }
      );
    } else if (amountDeltaForOldClient !== 0) {
      await clientsCol.updateOne(
        { _id: project.clientId },
        { $inc: { totalAmount: amountDeltaForOldClient } }
      );
    }

    // Return updated DTO with client name
    const out = await projectsCol.aggregate([
      { $match: { _id: project._id } },
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
    ]).next();

    return NextResponse.json(
      toProjectDTO(out as unknown as ProjectDoc, (out as any).clientName)
    );
  } catch (err) {
    console.error("[PUT /api/projects/:id] Failed:", err);
    return jsonError("Failed to update project", 500);
  }
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    if (!ObjectId.isValid(id)) return jsonError("Invalid id", 400);

    const projectsCol = await projectsCollection();
    const clientsCol = await clientsCollection();

    const project = await projectsCol.findOne({ _id: new ObjectId(id) });
    if (!project) return jsonError("Not found", 404);

    await projectsCol.deleteOne({ _id: project._id });

    // decrement counters and subtract amount
    await clientsCol.updateOne(
      { _id: project.clientId },
      { $inc: { totalProjects: -1, totalAmount: -project.amount } }
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/projects/:id] Failed:", err);
    return jsonError("Failed to delete project", 500);
  }
}
