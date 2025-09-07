// /lib/collections.ts
import clientPromise from "./mongodb";
import type { MongoClient, Db, Collection } from "mongodb";

// If you have these types, we'll use them for strong typing.
// Otherwise you can temporarily change <ProjectDoc> etc. to <any>.
import type { ProjectDoc } from "@/types/projects";
import type { ClientDoc } from "@/types/clients";

// Keep DB name in one place
const DB_NAME = process.env.MONGODB_DB || "freelancers-dashboard";

async function db(): Promise<Db> {
  const client = (await clientPromise) as MongoClient;
  return client.db(DB_NAME);
}

/* -------------------------------- Projects ------------------------------- */

export async function projectsCollection(): Promise<Collection<ProjectDoc>> {
  const dbase = await db();
  const col = dbase.collection<ProjectDoc>("projects");

  // Helpful indexes (idempotent; safe to call on every boot)
  await col.createIndex({ clientId: 1, deadline: 1 }, { name: "by_client_deadline" });
  await col.createIndex({ name: 1 }, { name: "name_1" });

  return col;
}

/* -------------------------------- Clients -------------------------------- */

export async function clientsCollection(): Promise<Collection<ClientDoc>> {
  const dbase = await db();
  const col = dbase.collection<ClientDoc>("clients");

  // Common lookups
  await col.createIndex({ email: 1 }, { name: "email_1", sparse: true });
  await col.createIndex({ name: 1 }, { name: "name_1" });

  return col;
}

/* -------------------------------- Invoices ------------------------------- */

export type InvoiceDoc = {
  _id?: any;
  invoiceId: string; // unique human-readable ID (e.g., INV-2025-00001)
  client: string;    // client display name
  clientId?: string; // optional FK to clients._id as string
  amount: number;
  status: "Paid" | "Pending";
  createdAt: Date;
  updatedAt: Date;
};

export async function invoicesCollection(): Promise<Collection<InvoiceDoc>> {
  const dbase = await db();
  const col = dbase.collection<InvoiceDoc>("invoices");

  await col.createIndex({ invoiceId: 1 }, { unique: true, name: "invoiceId_1" });
  await col.createIndex({ createdAt: 1 }, { name: "createdAt_1" });
  await col.createIndex({ clientId: 1 }, { name: "clientId_1" });

  return col;
}

/* ------------------------------- Counters -------------------------------- */

type CounterDoc = {
  _id: string; // e.g. "invoices:2025"
  seq: number;
  year?: number;
};

export async function countersCollection(): Promise<Collection<CounterDoc>> {
  const dbase = await db();
  const col = dbase.collection<CounterDoc>("counters");
  await col.createIndex({ _id: 1 }, { unique: true, name: "_id_1" });
  return col;
}
