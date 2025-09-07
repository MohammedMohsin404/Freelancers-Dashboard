// /types/projects.ts
import { z } from "zod";
import { ObjectId } from "mongodb";

/** DB shape */
export type ProjectDoc = {
  _id: ObjectId;
  name: string;
  clientId: ObjectId;          // FK to clients
  status: "Pending" | "In Progress" | "Completed";
  amount: number;              // NEW
  deadline: Date;
  createdAt: Date;
  updatedAt: Date;
};

/** DTO sent to UI */
export type ProjectDTO = {
  id: string;
  name: string;
  client: string;              // client name (denormalized for UI)
  status: "Pending" | "In Progress" | "Completed";
  amount: number;              // NEW
  deadline: string;            // ISO
  createdAt?: string;
  updatedAt?: string;
};

export const ProjectStatus = z.enum(["Pending", "In Progress", "Completed"]);

export const ProjectCreateSchema = z.object({
  name: z.string().min(1),
  clientId: z.string().min(1),
  status: ProjectStatus,
  amount: z.number().min(0),            // NEW
  deadline: z.string().min(1),
});
export type ProjectCreate = z.infer<typeof ProjectCreateSchema>;

export const ProjectUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  clientId: z.string().min(1).optional(),
  status: ProjectStatus.optional(),
  amount: z.number().min(0).optional(), // NEW
  deadline: z.string().min(1).optional(),
});
export type ProjectUpdate = z.infer<typeof ProjectUpdateSchema>;

export function toProjectDTO(doc: ProjectDoc, clientName: string): ProjectDTO {
  return {
    id: doc._id.toString(),
    name: doc.name,
    client: clientName,
    status: doc.status,
    amount: doc.amount,
    deadline: doc.deadline.toISOString(),
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
  };
}
