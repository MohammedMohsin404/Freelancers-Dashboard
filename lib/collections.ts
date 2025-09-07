// /lib/collections.ts
import clientPromise from "./mongodb";
import type { MongoClient, Db, Collection } from "mongodb";

// If you have these types locally, keep them; otherwise change to <any>
import type { ProjectDoc } from "@/types/projects";
import type { ClientDoc } from "@/types/clients";

const DB_NAME = process.env.MONGODB_DB || "freelancers-dashboard";

/** Single source of truth to get the Db (same client everywhere) */
export async function getDb(): Promise<Db> {
  const client = (await clientPromise) as MongoClient;
  return client.db(DB_NAME);
}

/* ------------------------------ Projects ------------------------------ */
export async function projectsCollection(): Promise<Collection<ProjectDoc>> {
  const db = await getDb();
  const col = db.collection<ProjectDoc>("projects");
  await col.createIndex({ clientId: 1, deadline: 1 }, { name: "by_client_deadline" });
  await col.createIndex({ name: 1 }, { name: "name_1" });
  return col;
}

/* ------------------------------- Clients ------------------------------ */
export async function clientsCollection(): Promise<Collection<ClientDoc>> {
  const db = await getDb();
  const col = db.collection<ClientDoc>("clients");
  await col.createIndex({ email: 1 }, { name: "email_1", sparse: true });
  await col.createIndex({ name: 1 }, { name: "name_1" });
  return col;
}

/* ------------------------------- Invoices ----------------------------- */
export type InvoiceDoc = {
  _id?: any;
  invoiceId: string;          // unique, human-friendly
  client: string;             // denormalized client name
  clientId?: string;          // FK to clients._id as string (optional)
  amount: number;
  status: "Paid" | "Pending";
  createdAt: Date;
  updatedAt: Date;
};

export async function invoicesCollection(): Promise<Collection<InvoiceDoc>> {
  const db = await getDb();
  const col = db.collection<InvoiceDoc>("invoices");
  await col.createIndex({ invoiceId: 1 }, { unique: true, name: "invoiceId_1" });
  await col.createIndex({ createdAt: 1 }, { name: "createdAt_1" });
  await col.createIndex({ clientId: 1 }, { name: "clientId_1" });
  return col;
}

/* ------------------------------- Counters ----------------------------- */
type CounterDoc = { _id: string; seq: number };

export async function countersCollection(): Promise<Collection<CounterDoc>> {
  const db = await getDb();
  // DO NOT create an index on _id with options (Mongo forbids options on _id)
  return db.collection<CounterDoc>("counters");
}
