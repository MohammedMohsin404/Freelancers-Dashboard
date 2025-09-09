import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { invoicesCollection } from "@/lib/collections";
import { type InvoiceDoc, toInvoiceDTO as toDTO } from "@/types/invoices";

function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: { message, ...extra } }, { status });
}

/* ========== GET /api/invoices/[id] ========== */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!ObjectId.isValid(id)) return jsonError("Invalid id", 400);

  try {
    const col = await invoicesCollection();
    const doc = (await col.findOne({ _id: new ObjectId(id) })) as InvoiceDoc | null;
    if (!doc) return jsonError("Not found", 404);
    return NextResponse.json(toDTO(doc), { status: 200 });
  } catch (err: any) {
    console.error("[GET /api/invoices/:id] Failed:", err);
    return jsonError("Failed to fetch invoice", 500);
  }
}

/* ========== PUT /api/invoices/[id] ========== */
export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!ObjectId.isValid(id)) return jsonError("Invalid id", 400);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const b = body as Partial<{
    client: string;
    clientId: string;
    amount: number;
    status: "Paid" | "Pending";
  }>;

  const update: Partial<InvoiceDoc> = {
    ...(typeof b.client === "string" && b.client.trim() ? { client: b.client.trim() } : {}),
    ...(typeof b.clientId === "string" && b.clientId.trim() ? { clientId: b.clientId.trim() } : {}),
    ...(typeof b.amount === "number" && Number.isFinite(b.amount) ? { amount: b.amount } : {}),
    ...(b?.status === "Paid" || b?.status === "Pending" ? { status: b.status } : {}),
    updatedAt: new Date(),
  };

  try {
    const col = await invoicesCollection();

    // Driver-version-agnostic handling: the result may be either a document/null or a { value } wrapper.
    const raw: unknown = await col.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: "after" as any } // type-relaxed for cross-version support
    );

    // Normalize to `updated: InvoiceDoc | null`
    const updated: InvoiceDoc | null =
      raw && typeof raw === "object" && raw !== null && "value" in (raw as any)
        ? ((raw as any).value as InvoiceDoc | null)
        : ((raw as any) as InvoiceDoc | null);

    if (!updated) return jsonError("Not found", 404);

    return NextResponse.json(toDTO(updated), { status: 200 });
  } catch (err: any) {
    console.error("[PUT /api/invoices/:id] Failed:", err);
    if (err?.code === 11000) {
      return jsonError("Duplicate key (invoiceId already exists)", 409, { key: err?.keyValue });
    }
    return jsonError("Failed to update invoice", 500);
  }
}

/* ========== DELETE /api/invoices/[id] ========== */
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!ObjectId.isValid(id)) return jsonError("Invalid id", 400);

  try {
    const col = await invoicesCollection();
    const res = await col.deleteOne({ _id: new ObjectId(id) });
    if (res.deletedCount === 0) return jsonError("Not found", 404);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    console.error("[DELETE /api/invoices/:id] Failed:", err);
    return jsonError("Failed to delete invoice", 500);
  }
}
