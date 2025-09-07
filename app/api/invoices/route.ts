// /app/api/invoices/route.ts
import { NextResponse } from "next/server";
import { invoicesCollection, type InvoiceDoc } from "@/lib/collections";
import { getNextInvoiceSeq, formatInvoiceId } from "@/lib/counters";

function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: { message, ...extra } }, { status });
}

function toDTO(doc: any) {
  return {
    id: doc._id?.toString(),
    invoiceId: doc.invoiceId,
    client: doc.client,
    clientId: doc.clientId,
    amount: doc.amount,
    status: doc.status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

/* ------------------------------- GET --------------------------------- */
export async function GET() {
  try {
    const col = await invoicesCollection();
    const rows = await col.find().sort({ createdAt: -1 }).toArray();
    return NextResponse.json(rows.map(toDTO));
  } catch (e: any) {
    console.error("[GET /api/invoices] Failed:", e);
    return jsonError("Failed to load invoices", 500);
  }
}

/* ------------------------------- POST -------------------------------- */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { client, clientId, amount, status } = body || {};

    if (!client || (typeof amount !== "number" || Number.isNaN(amount)) || !status) {
      return jsonError("Invalid payload", 422);
    }

    const col = await invoicesCollection();
    const now = new Date();
    const year = now.getUTCFullYear();

    // Up to a few retries if someone else inserts at the exact same ms
    for (let attempt = 1; attempt <= 5; attempt++) {
      const seq = await getNextInvoiceSeq(year);
      const invoiceId = formatInvoiceId(year, seq);

      const doc: InvoiceDoc = {
        invoiceId,
        client,
        clientId,
        amount,
        status,
        createdAt: now,
        updatedAt: now,
      };

      try {
        const insert = await col.insertOne(doc);
        const created = await col.findOne({ _id: insert.insertedId });
        return NextResponse.json(toDTO(created));
      } catch (err: any) {
        // Only retry duplicate invoiceId collisions
        if (err?.code === 11000) {
          console.warn(
            `[POST /api/invoices] Duplicate invoiceId "${invoiceId}" on attempt ${attempt}, retrying…`
          );
          continue;
        }
        throw err;
      }
    }

    return jsonError("Failed after multiple retries", 500);
  } catch (e: any) {
    console.error("[POST /api/invoices] Failed:", e);
    return jsonError("Create failed", 500);
  }
}
