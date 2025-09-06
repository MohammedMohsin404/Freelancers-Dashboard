// /lib/collections.ts
import clientPromise from "./mongodb";
import { Collection, Db } from "mongodb";
import type { ProjectDoc } from "@/types/projects";

const DB_NAME = process.env.MONGODB_DB || "freelancers-dashboard";

async function db(): Promise<Db> {
  const client = await clientPromise;
  return client.db(DB_NAME);
}

export async function projectsCollection(): Promise<Collection<ProjectDoc>> {
  const dbase = await db();
  return dbase.collection<ProjectDoc>("projects");
}
