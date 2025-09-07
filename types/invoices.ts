// /types/invoices.ts
import { z } from "zod";
import { ObjectId } from "mongodb";

export const InvoiceStatus = z.enum(["Paid", "Pending"]);

export const InvoiceCreateSchema = z.object({
  invoiceId: z.string().min(1, "Invoice ID required"),
  client: z.string().min(1, "Client name required"),
  amount: z.number().nonnegative("Amount must be ≥ 0"),
  status: InvoiceStatus.default("Pending"),
});

export const InvoiceUpdateSchema = z.object({
  invoiceId: z.string().min(1).optional(),
  client: z.string().min(1).optional(),
  amount: z.number().nonnegative().optional(),
  status: InvoiceStatus.optional(),
});

export type InvoiceCreate = z.infer<typeof InvoiceCreateSchema>;
export type InvoiceUpdate = z.infer<typeof InvoiceUpdateSchema>;

export type InvoiceDoc = {
  _id: ObjectId;
  invoiceId: string;
  client: string;
  amount: number;
  status: "Paid" | "Pending";
  createdAt: Date;
  updatedAt: Date;
};

export type InvoiceDTO = {
  id: string;
  invoiceId: string;
  client: string;
  amount: number;
  status: "Paid" | "Pending";
  createdAt: string;
  updatedAt: string;
};

export function toInvoiceDTO(doc: InvoiceDoc): InvoiceDTO {
  return {
    id: doc._id.toHexString(),
    invoiceId: doc.invoiceId,
    client: doc.client,
    amount: doc.amount,
    status: doc.status,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}
