// /app/clients/page.tsx
"use client";

import { useEffect, useMemo, useState, ChangeEvent } from "react";
import { Plus, Edit, Trash2, Users, Mail, Building2, Hash, X } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion, Variants } from "framer-motion";
import toast from "react-hot-toast";
import Modal from "../components/Modal";
import { safeFetchJSON, jsonBody, HttpError } from "@/lib/http";

type Client = {
  id: string;
  name: string;
  email: string;
  company: string;
  totalProjects: number;
  createdAt?: string;
  updatedAt?: string;
};

function avatarInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Client, "id">>({
    name: "",
    email: "",
    company: "",
    totalProjects: 0,
  });

  const [search, setSearch] = useState("");
  const reduceMotion = useReducedMotion();

  // Load from API
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await safeFetchJSON<Client[]>("/api/clients");
        if (alive) setClients(data);
      } catch (e: any) {
        const msg = e instanceof HttpError ? e.message : e?.message || "Failed to load clients";
        if (alive) setError(msg);
        toast.error(msg);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const filteredClients = useMemo(() => {
    const q = search.trim().toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q)
    );
  }, [clients, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);

    try {
      if (editId) {
        await toast.promise(
          (async () => {
            const updated = await safeFetchJSON<Client>(
              `/api/clients/${editId}`,
              { method: "PUT", ...jsonBody(formData) }
            );
            setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
          })(),
          { loading: "Updating client…", success: "Client updated", error: (err) => err?.message || "Update failed" }
        );
      } else {
        await toast.promise(
          (async () => {
            const created = await safeFetchJSON<Client>(
              "/api/clients",
              { method: "POST", ...jsonBody(formData) }
            );
            setClients((prev) => [created, ...prev]);
          })(),
          { loading: "Creating client…", success: "Client created", error: (err) => err?.message || "Create failed" }
        );
      }

      setModalOpen(false);
      setFormData({ name: "", email: "", company: "", totalProjects: 0 });
      setEditId(null);
    } catch (e: any) {
      setError(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (client: Client) => {
    setEditId(client.id);
    setFormData({
      name: client.name,
      email: client.email,
      company: client.company,
      totalProjects: client.totalProjects,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this client?")) return;
    try {
      await toast.promise(
        (async () => {
          await safeFetchJSON(`/api/clients/${id}`, { method: "DELETE" });
          setClients((prev) => prev.filter((c) => c.id !== id));
        })(),
        { loading: "Deleting…", success: "Client deleted", error: (err) => err?.message || "Delete failed" }
      );
    } catch (e: any) {
      setError(e?.message || "Delete failed");
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "totalProjects" ? Number(value) : value,
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
      <motion.div variants={headerVariants} initial="hidden" animate="show" className="mb-3 flex items-center gap-2">
        <Users className="size-5 text-primary" />
        <h2 className="text-base font-bold sm:text-lg md:text-xl">Clients</h2>
      </motion.div>

      {/* Controls */}
      <motion.div variants={controlsVariants} initial="hidden" animate="show" className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <motion.button whileTap={tap} whileHover={reduceMotion ? undefined : { y: -1 }} className="btn btn-primary flex items-center gap-2" onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Add Client
        </motion.button>

        <motion.input
          whileFocus={reduceMotion ? undefined : { scale: 1.01 }}
          transition={{ type: "spring", stiffness: 250, damping: 18, mass: 0.4 }}
          type="text"
          placeholder="Search by name, email, or company..."
          className="input input-bordered w-full sm:w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </motion.div>

      {/* Error banner */}
      {error && (
        <div className="alert alert-error mb-3">
          <span>{error}</span>
        </div>
      )}

      {/* MOBILE-FIRST: Cards on < md */}
      {!loading && (
        <motion.ul variants={listVariants} initial="hidden" animate="show" className="grid grid-cols-1 gap-3 sm:gap-4 md:hidden">
          <AnimatePresence initial={false}>
            {filteredClients.map((c) => (
              <motion.li key={c.id} variants={itemVariants} exit="exit">
                <motion.article whileHover={reduceMotion ? undefined : { y: -2 }} transition={{ duration: 0.15 }} className="relative rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div
                      className="
                        inline-grid place-items-center
                        w-10 h-10 rounded-full
                        bg-primary/10 text-primary
                        font-bold leading-none select-none
                        text-[0.95rem] tracking-wide
                      "
                      aria-hidden="true"
                    >
                      {avatarInitials(c.name)}
                    </div>

                    {/* Main info */}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-base-content truncate">{c.name}</h3>

                      <div className="mt-1 flex items-center gap-2 text-sm text-base-content/70">
                        <Mail className="size-4 shrink-0" />
                        <span className="truncate">{c.email}</span>
                      </div>

                      <div className="mt-1 flex items-center gap-2 text-sm text-base-content/70">
                        <Building2 className="size-4 shrink-0" />
                        <span className="truncate">{c.company}</span>
                      </div>

                      <div className="mt-1 flex items-center gap-2 text-sm text-base-content/70">
                        <Hash className="size-4 shrink-0" />
                        <span className="truncate">Projects: {c.totalProjects}</span>
                      </div>

                      {/* Actions */}
                      <div className="mt-3 flex gap-2">
                        <motion.button whileTap={tap} className="btn btn-xs btn-outline" onClick={() => handleEdit(c)}>
                          <Edit size={14} />
                          Edit
                        </motion.button>
                        <motion.button whileTap={tap} className="btn btn-xs btn-ghost text-error" onClick={() => handleDelete(c.id)}>
                          <Trash2 size={14} />
                          Delete
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              </motion.li>
            ))}
            {filteredClients.length === 0 && (
              <motion.li variants={itemVariants} className="text-center text-base-content/60 py-4">
                No clients found.
              </motion.li>
            )}
          </AnimatePresence>
        </motion.ul>
      )}

      {/* TABLE on md+ */}
      {!loading && (
        <div className="hidden md:block overflow-x-auto bg-base-100 shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-base-300">
            <thead className="bg-base-200">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Company</th>
                <th className="px-4 py-2 text-left">Total Projects</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-300">
              <AnimatePresence initial={false}>
                {filteredClients.map((client) => (
                  <motion.tr
                    key={client.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    whileHover={reduceMotion ? undefined : { backgroundColor: "var(--fallback-b1,oklch(var(--b1)))" }}
                    transition={{ duration: 0.15 }}
                    className="hover:bg-base-100"
                  >
                    <td className="px-4 py-2">{client.name}</td>
                    <td className="px-4 py-2">{client.email}</td>
                    <td className="px-4 py-2">{client.company}</td>
                    <td className="px-4 py-2">{client.totalProjects}</td>
                    <td className="px-4 py-2">
                      <div className="flex justify-center gap-2">
                        <motion.button whileTap={tap} className="btn btn-sm btn-ghost" onClick={() => handleEdit(client)}>
                          <Edit size={16} />
                        </motion.button>
                        <motion.button whileTap={tap} className="btn btn-sm btn-ghost text-error" onClick={() => handleDelete(client.id)}>
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {filteredClients.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-base-content/60">
                      No clients found.
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <motion.div
              className="bg-base-100 rounded-xl w-full max-w-md p-6 relative shadow-xl"
              initial={reduceMotion ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.98, y: reduceMotion ? 0 : 8 }}
              transition={{ duration: 0.2 }}
              role="dialog"
              aria-modal="true"
              aria-label={editId ? "Edit Client" : "Add New Client"}
            >
              <button
                className="absolute right-3 top-3 text-base-content/60 hover:text-base-content"
                onClick={() => {
                  setModalOpen(false);
                  setEditId(null);
                }}
                aria-label="Close"
              >
                <X size={20} />
              </button>

              <h2 className="text-lg font-bold mb-4">{editId ? "Edit Client" : "Add New Client"}</h2>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <motion.input
                  whileFocus={reduceMotion ? undefined : { scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 250, damping: 18, mass: 0.4 }}
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="input input-bordered w-full"
                />
                <motion.input
                  whileFocus={reduceMotion ? undefined : { scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 250, damping: 18, mass: 0.4 }}
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="input input-bordered w-full"
                />
                <motion.input
                  whileFocus={reduceMotion ? undefined : { scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 250, damping: 18, mass: 0.4 }}
                  type="text"
                  name="company"
                  placeholder="Company"
                  value={formData.company}
                  onChange={handleInputChange}
                  required
                  className="input input-bordered w-full"
                />
                <motion.input
                  whileFocus={reduceMotion ? undefined : { scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 250, damping: 18, mass: 0.4 }}
                  type="number"
                  name="totalProjects"
                  placeholder="Total Projects"
                  value={formData.totalProjects}
                  onChange={handleInputChange}
                  required
                  className="input input-bordered w-full"
                />
                <motion.button
                  whileTap={tap}
                  type="submit"
                  className="btn btn-primary mt-2"
                  disabled={saving}
                >
                  {saving ? "Saving…" : editId ? "Update Client" : "Add Client"}
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
