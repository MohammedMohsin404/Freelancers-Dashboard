// /app/api/invoices/[id]/route.ts
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { invoicesCollection } from "@/lib/collections";

function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: { message, ...extra } }, { status });
}
const toDTO = (doc: any) => ({
  id: doc._id?.toString?.() ?? doc._id,
  invoiceId: doc.invoiceId,
  client: doc.client,
  clientId: doc.clientId,
  amount: doc.amount,
  status: doc.status,
  createdAt: doc.createdAt?.toISOString?.() ?? doc.createdAt,
  updatedAt: doc.updatedAt?.toISOString?.() ?? doc.updatedAt,
});

export async function PUT(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!ObjectId.isValid(id)) return jsonError("Invalid id", 400);

  try {
    const body = await _req.json().catch(() => null);
    if (!body || typeof body !== "object") return jsonError("Invalid JSON body", 400);

    const { client, clientId, amount, status } = body as {
      client: string;
      clientId?: string;
      amount: number;
      status: "Paid" | "Pending";
    };

    if (!client || typeof client !== "string") return jsonError("client is required", 422);
    const numAmount = Number(amount);
    if (!Number.isFinite(numAmount) || numAmount < 0) return jsonError("amount must be non-negative", 422);
    if (!["Paid", "Pending"].includes(status)) return jsonError(`status must be "Paid" or "Pending"`, 422);

    const col = await invoicesCollection();
    const res = await col.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          client,
          clientId,
          amount: numAmount,
          status,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!res.value) return jsonError("Not found", 404);
    return NextResponse.json(toDTO(res.value));
  } catch (err: any) {
    console.error("[PUT /api/invoices/:id] Failed:", err);
    return jsonError("Failed to update invoice", 500);
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!ObjectId.isValid(id)) return jsonError("Invalid id", 400);

  try {
    const col = await invoicesCollection();
    const res = await col.deleteOne({ _id: new ObjectId(id) });
    if (!res.deletedCount) return jsonError("Not found", 404);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[DELETE /api/invoices/:id] Failed:", err);
    return jsonError("Failed to delete invoice", 500);
  }
}
