// /types/clients.ts
import { z } from "zod";
import { ObjectId } from "mongodb";

/** Base schema for a client */
export const ClientBaseSchema = z.object({
  name: z.string().min(1, "Name is required").max(120, "Name too long"),
  email: z.string().email("Invalid email"),
  company: z.string().min(1, "Company is required").max(120, "Company too long"),
  totalProjects: z.number().int().min(0, "Must be >= 0").default(0),
});

/** Create = all required */
export const ClientCreateSchema = ClientBaseSchema;
/** Update = all optional */
export const ClientUpdateSchema = ClientBaseSchema.partial();

/** Inferred types */
export type ClientCreate = z.infer<typeof ClientCreateSchema>;
export type ClientUpdate = z.infer<typeof ClientUpdateSchema>;

/** MongoDB document shape */
export interface ClientDoc {
  _id: ObjectId;
  name: string;
  email: string;
  company: string;
  totalProjects: number;
  createdAt: Date;
  updatedAt: Date;
}

/** DTO to the frontend */
export type ClientDTO = {
  id: string;          // stringified ObjectId
  name: string;
  email: string;
  company: string;
  totalProjects: number;
  createdAt: string;   // ISO
  updatedAt: string;   // ISO
};

export function toClientDTO(doc: ClientDoc): ClientDTO {
  return {
    id: doc._id.toHexString(),
    name: doc.name,
    email: doc.email,
    company: doc.company,
    totalProjects: doc.totalProjects,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

/** Validate string ObjectIds */
export function isValidObjectId(id: string): boolean {
  try {
    // throws if invalid
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = new ObjectId(id);
    return true;
  } catch {
    return false;
  }
}
