// /lib/counters.ts
import { getDb } from "./collections";

type CounterDoc = { _id: string; seq: number };

/** Normalize findOneAndUpdate return across driver versions. */
function normalizeFindOneAndUpdate<T>(res: unknown): T | null {
  // v5/v6 style: { value?: T | null, ... }
  if (res && typeof res === "object" && "value" in (res as any)) {
    return (res as { value: T | null }).value ?? null;
  }
  // Older overloads may return T | null directly
  return (res as T | null) ?? null;
}

/**
 * Returns the next integer in a yearly sequence:
 *  { _id: 'invoices:2025', seq: 42 }
 * Atomic and concurrency-safe via $inc + upsert.
 */
export async function getNextInvoiceSeq(year: number): Promise<number> {
  const db = await getDb();
  const counters = db.collection<CounterDoc>("counters");
  const key = `invoices:${year}`;

  const raw = await counters.findOneAndUpdate(
    { _id: key },
    {
      // $inc on a missing field during upsert creates it with 1
      $inc: { seq: 1 },
      // keep optional — not strictly required with $inc, but harmless
      $setOnInsert: { _id: key },
    },
    { upsert: true, returnDocument: "after" as const }
  );

  const doc = normalizeFindOneAndUpdate<CounterDoc>(raw);

  // Defensive fallback if the driver returned null for some reason
  if (!doc || typeof doc.seq !== "number") {
    const ensure = await counters.findOne({ _id: key });
    return typeof ensure?.seq === "number" ? ensure.seq : 1;
  }

  return doc.seq;
}

/** INV-YYYY-00001 */
export function formatInvoiceId(year: number, seq: number): string {
  return `INV-${year}-${String(seq).padStart(5, "0")}`;
}
