// /lib/collections.ts
import type { Db, Collection, MongoClient } from "mongodb";
import getMongoClientPromise from "@/lib/mongodb";
import type { ProjectDoc } from "@/types/projects";
import type { ClientDoc } from "@/types/clients";

const DB_NAME = process.env.MONGODB_DB || "freelancers-dashboard";

async function db(): Promise<Db> {
  const client: MongoClient = await getMongoClientPromise();
  return client.db(DB_NAME);
}

export async function projectsCollection(): Promise<Collection<ProjectDoc>> {
  const dbase = await db();
  return dbase.collection<ProjectDoc>("projects");
}

export async function clientsCollection(): Promise<Collection<ClientDoc>> {
  const dbase = await db();
  return dbase.collection<ClientDoc>("clients");
}
