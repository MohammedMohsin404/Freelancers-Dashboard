"use client";

import { useState, useMemo, ChangeEvent } from "react";
import { Plus, Edit, Trash2, X, Receipt, User, DollarSign } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion, Variants } from "framer-motion";
import Modal from "../components/Modal";

interface Invoice {
  id: number;
  invoiceId: string;
  client: string;
  amount: number;
  status: "Paid" | "Pending";
}

// Seed data
const initialInvoices: Invoice[] = [
  { id: 1, invoiceId: "INV-1001", client: "Acme Corp",  amount: 1200, status: "Pending" },
  { id: 2, invoiceId: "INV-1002", client: "Beta LLC",   amount:  800, status: "Paid"    },
  { id: 3, invoiceId: "INV-1003", client: "Gamma Inc",  amount:  450, status: "Pending" },
];

function statusPill(status: Invoice["status"]) {
  const base = "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold sm:text-xs";
  return status === "Paid"
    ? `${base} bg-green-100 text-green-800`
    : `${base} bg-yellow-100 text-yellow-800`;
}

function formatMoney(value: number) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<Invoice, "id">>({
    invoiceId: "",
    client: "",
    amount: 0,
    status: "Pending",
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"" | Invoice["status"]>("");
  const reduceMotion = useReducedMotion();

  const filteredInvoices = useMemo(() => {
    const q = search.trim().toLowerCase();
    return invoices
      .filter((i) => i.invoiceId.toLowerCase().includes(q) || i.client.toLowerCase().includes(q))
      .filter((i) => (filterStatus ? i.status === filterStatus : true));
  }, [invoices, search, filterStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId !== null) {
      setInvoices((prev) => prev.map((i) => (i.id === editId ? { ...i, ...formData, id: editId } : i)));
    } else {
      setInvoices((prev) => [{ ...formData, id: Date.now() }, ...prev]);
    }
    setModalOpen(false);
    setFormData({ invoiceId: "", client: "", amount: 0, status: "Pending" });
    setEditId(null);
  };

  const handleEdit = (invoice: Invoice) => {
    setEditId(invoice.id);
    setFormData({ invoiceId: invoice.invoiceId, client: invoice.client, amount: invoice.amount, status: invoice.status });
    setModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      setInvoices((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      status: name === "status" ? (value as Invoice["status"]) : prev.status,
      [name]: name === "amount" ? Number(value) : value,
    }));
  };

  // Animations
  const headerVariants: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  };

  const controlsVariants: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 6 },
    show: { opacity: 1, y: 0, transition: { duration: 0.2, delay: 0.05 } },
  };

  const listVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: reduceMotion ? {} : { staggerChildren: 0.06, delayChildren: 0.06 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 10, scale: reduceMotion ? 1 : 0.98 },
    show:   { opacity: 1, y: 0, scale: 1, transition: { duration: 0.25 } },
    exit:   { opacity: 0, y: reduceMotion ? 0 : -6, scale: reduceMotion ? 1 : 0.98, transition: { duration: 0.18 } },
  };

  const tap = { scale: reduceMotion ? 1 : 0.98 };

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <motion.div
        variants={headerVariants}
        initial="hidden"
        animate="show"
        className="mb-3 flex items-center gap-2"
      >
        <Receipt className="size-5 text-primary" />
        <h2 className="text-base font-bold sm:text-lg md:text-xl">Invoices</h2>
      </motion.div>

      {/* Controls */}
      <motion.div
        variants={controlsVariants}
        initial="hidden"
        animate="show"
        className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <motion.button
          whileTap={tap}
          whileHover={reduceMotion ? undefined : { y: -1 }}
          className="btn btn-primary flex items-center gap-2"
          onClick={() => setModalOpen(true)}
        >
          <Plus size={16} /> Add Invoice
        </motion.button>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <motion.input
            whileFocus={reduceMotion ? undefined : { scale: 1.01 }}
            transition={{ type: "spring", stiffness: 250, damping: 18, mass: 0.4 }}
            type="text"
            placeholder="Search by invoice ID or client..."
            className="input input-bordered w-full sm:w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <motion.select
            whileFocus={reduceMotion ? undefined : { scale: 1.01 }}
            transition={{ type: "spring", stiffness: 250, damping: 18, mass: 0.4 }}
            className="select select-bordered w-full sm:w-48"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as "" | Invoice["status"])}
          >
            <option value="">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </motion.select>
        </div>
      </motion.div>

      {/* MOBILE-FIRST: cards on < md */}
      <motion.ul
        variants={listVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-3 sm:gap-4 md:hidden"
      >
        <AnimatePresence initial={false}>
          {filteredInvoices.map((inv) => (
            <motion.li key={inv.id} variants={itemVariants} exit="exit">
              <motion.article
                whileHover={reduceMotion ? undefined : { y: -2 }}
                transition={{ duration: 0.15 }}
                className="relative rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm"
              >
                {/* Status pill */}
                <div className="absolute right-3 top-3">
                  <span className={statusPill(inv.status)}>{inv.status}</span>
                </div>

                {/* Title */}
                <header className="pr-24 mb-1 flex items-center gap-2">
                  <Receipt className="size-4 text-base-content/70" />
                  <h3 className="text-base font-semibold text-base-content">{inv.invoiceId}</h3>
                </header>

                {/* Client */}
                <div className="mt-1 flex items-center gap-2 text-sm text-base-content/70">
                  <User className="size-4" />
                  <span className="truncate">{inv.client}</span>
                </div>

                {/* Amount */}
                <div className="mt-1 flex items-center gap-2 text-sm text-base-content/70">
                  <DollarSign className="size-4" />
                  <span>{formatMoney(inv.amount)}</span>
                </div>

                {/* Actions */}
                <div className="mt-3 flex gap-2">
                  <motion.button whileTap={tap} className="btn btn-xs btn-outline" onClick={() => handleEdit(inv)}>
                    <Edit size={14} />
                    Edit
                  </motion.button>
                  <motion.button
                    whileTap={tap}
                    className="btn btn-xs btn-ghost text-error"
                    onClick={() => handleDelete(inv.id)}
                  >
                    <Trash2 size={14} />
                    Delete
                  </motion.button>
                </div>
              </motion.article>
            </motion.li>
          ))}
          {filteredInvoices.length === 0 && (
            <motion.li variants={itemVariants} className="text-center text-base-content/60 py-4">
              No invoices found.
            </motion.li>
          )}
        </AnimatePresence>
      </motion.ul>

      {/* TABLE on md+ */}
      <div className="hidden md:block overflow-x-auto bg-base-100 shadow-md rounded-lg">
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
              {filteredInvoices.map((inv) => (
                <motion.tr
                  key={inv.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  whileHover={reduceMotion ? undefined : { backgroundColor: "var(--fallback-b1,oklch(var(--b1)))" }}
                  transition={{ duration: 0.15 }}
                  className="hover:bg-base-100"
                >
                  <td className="px-4 py-2">{inv.invoiceId}</td>
                  <td className="px-4 py-2">{inv.client}</td>
                  <td className="px-4 py-2">{formatMoney(inv.amount)}</td>
                  <td className="px-4 py-2">
                    <span className={statusPill(inv.status)}>{inv.status}</span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex justify-center gap-2">
                      <motion.button whileTap={tap} className="btn btn-sm btn-ghost" onClick={() => handleEdit(inv)}>
                        <Edit size={16} />
                      </motion.button>
                      <motion.button
                        whileTap={tap}
                        className="btn btn-sm btn-ghost text-error"
                        onClick={() => handleDelete(inv.id)}
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-base-content/60">
                    No invoices found.
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Modal (uses your Modal shell; we animate the inner content) */}
      <AnimatePresence>
        {modalOpen && (
          <Modal
            title={editId ? "Edit Invoice" : "Add New Invoice"}
            onClose={() => {
              setModalOpen(false);
              setEditId(null);
            }}
          >
            <motion.div
              initial={reduceMotion ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.98, y: reduceMotion ? 0 : 8 }}
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <motion.input
                  whileFocus={reduceMotion ? undefined : { scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 250, damping: 18, mass: 0.4 }}
                  type="text"
                  name="invoiceId"
                  placeholder="Invoice ID"
                  value={formData.invoiceId}
                  onChange={handleInputChange}
                  required
                  className="input input-bordered w-full"
                />
                <motion.input
                  whileFocus={reduceMotion ? undefined : { scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 250, damping: 18, mass: 0.4 }}
                  type="text"
                  name="client"
                  placeholder="Client"
                  value={formData.client}
                  onChange={handleInputChange}
                  required
                  className="input input-bordered w-full"
                />
                <motion.input
                  whileFocus={reduceMotion ? undefined : { scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 250, damping: 18, mass: 0.4 }}
                  type="number"
                  name="amount"
                  placeholder="Amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  className="input input-bordered w-full"
                />
                <motion.select
                  whileFocus={reduceMotion ? undefined : { scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 250, damping: 18, mass: 0.4 }}
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="select select-bordered w-full"
                >
                  <option>Pending</option>
                  <option>Paid</option>
                </motion.select>
                <motion.button whileTap={tap} type="submit" className="btn btn-primary mt-2">
                  {editId ? "Update Invoice" : "Add Invoice"}
                </motion.button>
              </form>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
