// /app/invoices/page.tsx
"use client";

import { useEffect, useMemo, useState, useRef, ChangeEvent } from "react";
import { motion, AnimatePresence, useReducedMotion, Variants } from "framer-motion";
import { Plus, Edit, Trash2, Download, Receipt, DollarSign, User, RefreshCcw } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../components/Modal";

type Invoice = {
  id: string;
  invoiceId: string;
  client: string;
  clientId?: string;
  amount: number;
  status: "Paid" | "Pending";
  createdAt?: string;
  updatedAt?: string;
};

type Client = {
  id: string;
  name: string;
  email: string;
  company: string;
};

type ProjectLite = {
  id: string;
  client: string;
  clientId?: string;
  amount?: number;
};

function statusBadge(status: Invoice["status"]) {
  const base = "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold sm:text-xs";
  return status === "Paid" ? `${base} bg-green-100 text-green-800` : `${base} bg-yellow-100 text-yellow-800`;
}
function money(x: number) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(
      Number.isFinite(x) ? x : 0
    );
  } catch {
    const n = Number.isFinite(x) ? x : 0;
    return `$${n.toFixed(2)}`;
  }
}

export default function InvoicesPage() {
  const [list, setList] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<ProjectLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | "new" | null>(null); // disables while PUT/POST/DELETE
  const [error, setError] = useState<string | null>(null);

  // form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<{
    clientId: string;
    client: string;
    amount: number;
    status: "Paid" | "Pending";
  }>({
    clientId: "",
    client: "",
    amount: 0,
    status: "Pending",
  });

  // search
  const [search, setSearch] = useState("");
  const [q, setQ] = useState(""); // debounced value
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [filterStatus, setFilterStatus] = useState<"" | Invoice["status"]>("");
  const reduceMotion = useReducedMotion();

  /* ====== Load data ====== */
  const loadAll = async () => {
    try {
      setError(null);
      setLoading(true);
      const [invRes, cliRes, projRes] = await Promise.all([
        fetch("/api/invoices", { cache: "no-store" }),
        fetch("/api/clients", { cache: "no-store" }),
        fetch("/api/projects", { cache: "no-store" }),
      ]);
      if (!invRes.ok) throw new Error(`Failed to load invoices (${invRes.status})`);
      if (!cliRes.ok) throw new Error(`Failed to load clients (${cliRes.status})`);
      if (!projRes.ok) throw new Error(`Failed to load projects (${projRes.status})`);

      const invData: Invoice[] = await invRes.json();
      const cliData: Client[] = await cliRes.json();
      const projData: ProjectLite[] = await projRes.json();

      setList(invData);
      setClients(cliData);
      setProjects(
        projData.map((p) => ({
          id: p.id,
          client: p.client,
          clientId: p.clientId,
          amount: typeof p.amount === "string" ? Number(p.amount) : (p.amount ?? 0),
        }))
      );
    } catch (e: any) {
      const msg = e?.message || "Failed to load data";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ====== Debounce search ====== */
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setQ(search.trim().toLowerCase()), 200);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [search]);

  /* ====== Compute totals per client (from projects) ====== */
  const totalsByClient = useMemo(() => {
    const byId = new Map<string, number>();
    const byName = new Map<string, number>();

    projects.forEach((p) => {
      const amt = Number.isFinite(p.amount) ? (p.amount as number) : Number(p.amount) || 0;
      if (p.clientId) {
        byId.set(p.clientId, (byId.get(p.clientId) || 0) + amt);
      } else {
        byName.set(p.client, (byName.get(p.client) || 0) + amt);
      }
    });

    return { byId, byName };
  }, [projects]);

  /* ====== Filtered rows ====== */
  const filtered = useMemo(() => {
    return list
      .filter((i) => i.client.toLowerCase().includes(q) || i.invoiceId.toLowerCase().includes(q))
      .filter((i) => (filterStatus ? i.status === filterStatus : true));
  }, [list, q, filterStatus]);

  /* ====== Form interactions ====== */
  const handleAmountAutoFill = (clientId: string) => {
    const c = clients.find((x) => x.id === clientId);
    if (!c) {
      setForm((prev) => ({ ...prev, clientId, client: "", amount: 0 }));
      return;
    }

    const total =
      totalsByClient.byId.get(clientId) ??
      totalsByClient.byName.get(c.name) ??
      0;

    setForm((prev) => ({
      ...prev,
      clientId,
      client: c.name,
      amount: Number.isFinite(total) ? Number(total.toFixed(2)) : 0,
    }));
  };

  const handleInput = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "clientId") {
      handleAmountAutoFill(value);
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: name === "amount" ? Number(value) : (value as any),
    }));
  };

  const openCreate = () => {
    setEditId(null);
    setForm({ clientId: "", client: "", amount: 0, status: "Pending" });
    setModalOpen(true);
  };

  const openEdit = (inv: Invoice) => {
    const match =
      clients.find((c) => c.id === inv.clientId) ||
      clients.find((c) => c.name === inv.client);
    setEditId(inv.id);
    setForm({
      clientId: match?.id || "",
      client: match?.name || inv.client,
      amount: inv.amount,
      status: inv.status,
    });
    setModalOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientId) {
      toast.error("Please select a client");
      return;
    }
    const payload = {
      client: form.client,
      clientId: form.clientId,
      amount: Number.isFinite(form.amount) ? Number(form.amount) : 0,
      status: form.status,
    };

    if (editId) {
      setSavingId(editId);
      try {
        await toast.promise(
          (async () => {
            const res = await fetch(`/api/invoices/${editId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error(`Update failed (${res.status})`);
            const updated: Invoice = await res.json();
            setList((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
          })(),
          { loading: "Updating invoice…", success: "Invoice updated", error: "Failed to update" }
        );
        setModalOpen(false);
        setEditId(null);
      } finally {
        setSavingId(null);
      }
    } else {
      setSavingId("new");
      try {
        await toast.promise(
          (async () => {
            const res = await fetch("/api/invoices", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error(`Create failed (${res.status})`);
            const created: Invoice = await res.json();
            setList((prev) => [created, ...prev]);
          })(),
          { loading: "Creating invoice…", success: "Invoice created", error: "Failed to create" }
        );
        setModalOpen(false);
      } finally {
        setSavingId(null);
      }
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this invoice?")) return;
    setSavingId(id);
    try {
      await toast.promise(
        (async () => {
          const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
          if (!res.ok) throw new Error(`Delete failed (${res.status})`);
          setList((prev) => prev.filter((x) => x.id !== id));
        })(),
        { loading: "Deleting…", success: "Invoice deleted", error: "Failed to delete" }
      );
    } finally {
      setSavingId(null);
    }
  };

  const downloadPDF = (id: string) => {
    window.open(`/api/invoices/${id}/pdf`, "_blank");
  };

  // Animations
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 10, scale: reduceMotion ? 1 : 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.25 } },
    exit: { opacity: 0, y: reduceMotion ? 0 : -6, scale: reduceMotion ? 1 : 0.98, transition: { duration: 0.18 } },
  };
  const tap = { scale: reduceMotion ? 1 : 0.98 };

  return (
    <div className="p-4 sm:p-6">
      {/* Header + New Invoice button on LEFT */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Receipt className="size-5 text-primary" />
          <h2 className="text-base font-bold sm:text-lg md:text-xl">Invoices</h2>
          <motion.button
            whileTap={tap}
            className="btn btn-primary ml-2"
            onClick={openCreate}
            disabled={savingId === "new"}
          >
            <Plus className="size-4" /> {savingId === "new" ? "Working…" : "New Invoice"}
          </motion.button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <input
            type="text"
            placeholder="Search by invoice ID or client..."
            className="input input-bordered w-full sm:w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="select select-bordered w-full sm:w-48"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as "" | Invoice["status"])}
          >
            <option value="">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="alert alert-error mb-3">
          <div className="flex items-center gap-2">
            <span>{error}</span>
            <button className="btn btn-xs" onClick={loadAll}>
              <RefreshCcw className="size-3.5" /> Retry
            </button>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="bg-base-100 rounded-lg shadow-md p-4">
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div className="h-10 bg-base-200 rounded-md" key={i} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && !error && (
        <div className="text-center border border-dashed border-base-300 rounded-xl p-10">
          <p className="text-base-content/70 mb-3">No invoices match your filters.</p>
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus className="size-4" /> Create your first invoice
          </button>
        </div>
      )}

      {/* Desktop table */}
      {!loading && filtered.length > 0 && (
        <div className="overflow-x-auto bg-base-100 shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-base-300">
            <thead className="bg-base-200">
              <tr>
                <th className="px-4 py-2 text-left">Invoice ID</th>
                <th className="px-4 py-2 text-left">Client</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-300">
              <AnimatePresence initial={false}>
                {filtered.map((inv) => (
                  <motion.tr key={inv.id} variants={itemVariants} initial="hidden" animate="show" exit="exit">
                    <td className="px-4 py-2">{inv.invoiceId}</td>
                    <td className="px-4 py-2">{inv.client}</td>
                    <td className="px-4 py-2">{money(inv.amount)}</td>
                    <td className="px-4 py-2">
                      <span className={statusBadge(inv.status)}>{inv.status}</span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          className="btn btn-sm btn-ghost"
                          onClick={() => openEdit(inv)}
                          disabled={savingId === inv.id}
                          aria-label={`Edit ${inv.invoiceId}`}
                        >
                          <Edit className="size-4" />
                        </button>
                        <button
                          className="btn btn-sm btn-ghost text-error"
                          onClick={() => remove(inv.id)}
                          disabled={savingId === inv.id}
                          aria-label={`Delete ${inv.invoiceId}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                        <button
                          className="btn btn-sm btn-ghost"
                          onClick={() => downloadPDF(inv.id)}
                          aria-label={`Download ${inv.invoiceId} PDF`}
                        >
                          <Download className="size-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <Modal
            title={editId ? "Edit Invoice" : "Create Invoice"}
            onClose={() => {
              setModalOpen(false);
              setEditId(null);
            }}
          >
            <motion.form
              onSubmit={save}
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0.9 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0.9 }}
              className="flex flex-col gap-3"
            >
              {/* Client (from DB) — selecting auto-fills Amount from projects total */}
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text flex items-center gap-2">
                    <User className="size-4" /> Client
                  </span>
                </label>
                <select
                  name="clientId"
                  value={form.clientId}
                  onChange={handleInput}
                  className="select select-bordered w-full"
                  required
                  disabled={savingId !== null}
                >
                  <option value="">Select Client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.company}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount (auto-filled, but editable) */}
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text flex items-center gap-2">
                    <DollarSign className="size-4" /> Amount
                  </span>
                </label>
                <input
                  type="number"
                  name="amount"
                  placeholder="Amount"
                  value={Number.isFinite(form.amount) ? form.amount : 0}
                  onChange={handleInput}
                  min={0}
                  step="0.01"
                  className="input input-bordered w-full"
                  required
                  disabled={savingId !== null}
                />
                <p className="mt-1 text-xs text-base-content/60">
                  Tip: Auto-fills from the client’s total project amount. Adjust if needed.
                </p>
              </div>

              {/* Status */}
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text">Status</span>
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleInput}
                  className="select select-bordered w-full"
                  disabled={savingId !== null}
                >
                  <option>Pending</option>
                  <option>Paid</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary mt-1" disabled={savingId !== null}>
                {savingId !== null ? "Saving…" : editId ? "Update Invoice" : "Create Invoice"}
              </button>
            </motion.form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
