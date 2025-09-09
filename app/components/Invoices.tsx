"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Dots } from "@/app/components/Loader";
import { Download, FileText } from "lucide-react";

type InvoiceDTO = {
  id: string;
  invoiceId: string;          // ← matches your API
  client: string;
  clientId?: string;
  amount: number;
  status: "Paid" | "Pending"; // adapt if you also use "Unpaid"
  createdAt?: string;
  updatedAt?: string;
};

function getStatusBadge(status: InvoiceDTO["status"]) {
  const base = "badge badge-sm px-3 py-2 text-white font-medium";
  switch (status) {
    case "Paid":
      return `${base} bg-success hover:bg-success/90`;
    case "Pending":
      return `${base} bg-warning hover:bg-warning/90`;
    default:
      return `${base} bg-neutral/60`;
  }
}

function formatCurrency(amount: number) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(Number.isFinite(amount) ? amount : 0);
  } catch {
    const n = Number.isFinite(amount) ? amount : 0;
    return `$${n.toFixed(2)}`;
  }
}

export default function Invoices() {
  const [invoices, setInvoices] = useState<InvoiceDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch("/api/invoices", { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to load invoices (${res.status})`);
        const data: InvoiceDTO[] = await res.json();
        if (alive) setInvoices(data);
      } catch (e: any) {
        if (alive) setErr(e?.message || "Failed to load invoices");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const openPDF = (id: string) => {
    window.open(`/api/invoices/${id}/pdf`, "_blank");
  };

  return (
    <motion.div
      className="bg-base-100 p-6 rounded-2xl shadow-lg"
      initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <motion.h2
        className="text-2xl font-bold text-base-content mb-6"
        initial={reduceMotion ? undefined : { opacity: 0, x: -20 }}
        animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Invoices
      </motion.h2>

      {loading && (
        <div className="py-4">
          <Dots label="Loading invoices" />
        </div>
      )}

      {err && !loading && (
        <div className="alert alert-error mb-4">
          <span>{err}</span>
        </div>
      )}

      {!loading && !err && (
        <div className="space-y-4">
          {invoices.map((invoice, index) => (
            <motion.div
              key={invoice.id}
              className="bg-base-100 p-4 rounded-lg border border-base-300 hover:bg-base-100/80 transition-colors"
              initial={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
              animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: 0.2 + index * 0.06 }}
              whileHover={reduceMotion ? undefined : { scale: 1.01, y: -2, transition: { duration: 0.18 } }}
              whileTap={{ scale: reduceMotion ? 1 : 0.98 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                <h3 className="text-lg font-semibold text-base-content">
                  Invoice {invoice.invoiceId}
                </h3>
                <span className={getStatusBadge(invoice.status)}>{invoice.status}</span>
              </div>

              <p className="text-base-content/70 mb-3">{invoice.client}</p>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-2xl font-bold text-base-content">
                  {formatCurrency(invoice.amount)}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/invoices/${invoice.id}`}
                    className="btn btn-sm btn-outline"
                    aria-label={`View details for ${invoice.invoiceId}`}
                  >
                    <FileText className="size-4" />
                    Details
                  </Link>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => openPDF(invoice.id)}
                    aria-label={`Download PDF for ${invoice.invoiceId}`}
                  >
                    <Download className="size-4" />
                    PDF
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {invoices.length === 0 && (
            <div className="text-center text-base-content/60 py-8">
              No invoices found.
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
