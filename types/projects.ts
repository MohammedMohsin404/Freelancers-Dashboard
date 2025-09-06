// /types/projects.ts
import { z } from "zod";
import { ObjectId } from "mongodb";

export const ProjectStatus = z.enum(["Pending", "In Progress", "Completed"]);

export const ProjectCreateSchema = z.object({
  name: z.string().min(1),
  client: z.string().min(1),
  status: ProjectStatus.default("Pending"),
  // Receive from client as ISO; convert to Date in API
  deadline: z.string().min(1),
});

export const ProjectUpdateSchema = ProjectCreateSchema.partial();

export type ProjectCreateInput = z.infer<typeof ProjectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof ProjectUpdateSchema>;

// Mongo shape
export interface ProjectDoc {
  _id: ObjectId;
  userKey: string; // we’ll store session.user.email as the owner key
  name: string;
  client: string;
  status: "Pending" | "In Progress" | "Completed";
  deadline: Date;
  createdAt: Date;
  updatedAt: Date;
}

// API output shape (id as string, deadline as ISO)
export interface ProjectDTO {
  id: string;
  name: string;
  client: string;
  status: "Pending" | "In Progress" | "Completed";
  deadline: string; // ISO
  createdAt: string;
  updatedAt: string;
}

export function toDTO(d: ProjectDoc): ProjectDTO {
  return {
    id: d._id.toString(),
    name: d.name,
    client: d.client,
    status: d.status,
    deadline: d.deadline.toISOString(),
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  };
}
