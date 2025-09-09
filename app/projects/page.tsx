"use client";

import { Dots } from "@/app/components/Loader";
import { SkeletonCard, SkeletonTableRow } from "@/app/components/Skeleton";
import toast from "react-hot-toast";
import { useState, useMemo, useEffect, ChangeEvent } from "react";
import { Plus, Edit, Trash2, X, User, Calendar, FolderOpen, DollarSign, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion, Variants } from "framer-motion";
import { HttpError, safeFetchJSON, jsonBody } from "@/lib/http";

/* ========== Types ========== */
interface Project {
  id: string;
  name: string;
  client: string; // client display name from API
  clientId?: string;
  status: "Pending" | "In Progress" | "Completed";
  amount: number;
  deadline: string; // ISO
  createdAt?: string;
  updatedAt?: string;
}

type ClientOption = { id: string; name: string };

/* ========== Helpers ========== */
function statusPill(status: Project["status"]) {
  const base = "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold sm:text-xs";
  if (status === "Pending") return `${base} bg-yellow-100 text-yellow-800`;
  if (status === "In Progress") return `${base} bg-blue-100 text-blue-800`;
  return `${base} bg-green-100 text-green-800`;
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.valueOf())) return iso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

function fmtMoney(value: number) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value ?? 0);
  } catch {
    return `$${(value ?? 0).toFixed(2)}`;
  }
}

function todayYYYYMMDD() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/* ========== Component ========== */
export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"" | Project["status"]>("");

  // formData with default deadline = today
  const [formData, setFormData] = useState<{
    name: string;
    clientId: string;
    status: Project["status"];
    amount: number;
    deadline: string;
  }>({
    name: "",
    clientId: "",
    status: "Pending",
    amount: 0,
    deadline: todayYYYYMMDD(),
  });

  const reduceMotion = useReducedMotion();

  /* ===== Load projects + clients ===== */
  const loadAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const [projData, clientData] = await Promise.all([
        safeFetchJSON<Project[]>("/api/projects"),
        safeFetchJSON<{ id: string; name: string }[]>("/api/clients").then(arr =>
          arr.map(c => ({ id: c.id, name: c.name }))
        ),
      ]);
      setProjects(projData);
      setClients(clientData);
    } catch (e: any) {
      const msg = e instanceof HttpError ? e.message : e?.message || "Failed to load";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  /* ===== Derived list ===== */
  const filteredProjects = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects
      .filter(p => p.name.toLowerCase().includes(q) || p.client.toLowerCase().includes(q))
      .filter(p => (filterStatus ? p.status === filterStatus : true));
  }, [projects, search, filterStatus]);

  /* ===== Form handlers ===== */
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "amount") {
      const num = Number(value);
      setFormData(prev => ({ ...prev, amount: Number.isFinite(num) ? num : 0 }));
      return;
    }

    if (name === "deadline") {
      const min = new Date(todayYYYYMMDD());
      const picked = new Date(value);
      if (picked < min) {
        toast.error("Deadline can’t be in the past");
        setFormData(prev => ({ ...prev, deadline: todayYYYYMMDD() }));
        return;
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openNewModal = () => {
    setEditId(null);
    setFormData({
      name: "",
      clientId: "",
      status: "Pending",
      amount: 0,
      deadline: todayYYYYMMDD(), // default today
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    if (!formData.clientId) {
      toast.error("Please select a client");
      return;
    }
    if (!formData.deadline) {
      toast.error("Please choose a deadline");
      return;
    }
    const min = new Date(todayYYYYMMDD());
    const picked = new Date(formData.deadline);
    if (picked < min) {
      toast.error("Deadline can’t be in the past");
      setFormData(prev => ({ ...prev, deadline: todayYYYYMMDD() }));
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (editId) {
        await toast.promise(
          (async () => {
            const updated = await safeFetchJSON<Project>(
              `/api/projects/${editId}`,
              { method: "PUT", ...jsonBody(formData) }
            );
            setProjects(prev => prev.map(p => (p.id === updated.id ? updated : p)));
          })(),
          { loading: "Updating project…", success: "Project updated", error: (err) => err?.message || "Update failed" }
        );
      } else {
        await toast.promise(
          (async () => {
            const created = await safeFetchJSON<Project>(
              "/api/projects",
              { method: "POST", ...jsonBody(formData) }
            );
            setProjects(prev => [created, ...prev]);
          })(),
          { loading: "Creating project…", success: "Project created", error: (err) => err?.message || "Create failed" }
        );
      }

      setModalOpen(false);
      setEditId(null);
      setFormData({ name: "", clientId: "", status: "Pending", amount: 0, deadline: todayYYYYMMDD() });
    } catch (e: any) {
      setError(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (project: Project) => {
    const found = clients.find(c => c.id === project.clientId) || clients.find(c => c.name === project.client);
    setEditId(project.id);
    setFormData({
      name: project.name,
      clientId: found?.id || "",
      status: project.status,
      amount: project.amount ?? 0,
      deadline: (project.deadline || todayYYYYMMDD()).slice(0, 10),
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      await toast.promise(
        (async () => {
          await safeFetchJSON(`/api/projects/${id}`, { method: "DELETE" });
          setProjects(prev => prev.filter(p => p.id !== id));
        })(),
        { loading: "Deleting…", success: "Project deleted", error: (err) => err?.message || "Delete failed" }
      );
    } catch (e: any) {
      setError(e?.message || "Delete failed");
    }
  };

  /* ===== Animations ===== */
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
    show: { opacity: 1, transition: reduceMotion ? {} : { staggerChildren: 0.06, delayChildren: 0.06 } },
  };
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 10, scale: reduceMotion ? 1 : 0.98 },
    show:   { opacity: 1, y: 0, scale: 1, transition: { duration: 0.25 } },
    exit:   { opacity: 0, y: reduceMotion ? 0 : -6, scale: reduceMotion ? 1 : 0.98, transition: { duration: 0.18 } },
  };
  const btnTap = { scale: reduceMotion ? 1 : 0.98 };

  /* ===== Render ===== */
  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <motion.div className="mb-3 flex items-center gap-2" variants={headerVariants} initial="hidden" animate="show">
        <FolderOpen className="size-5 text-primary" />
        <h2 className="text-base font-bold sm:text-lg md:text-xl">Projects</h2>
        <motion.button whileTap={btnTap} className="btn btn-primary ml-2" onClick={loadAll}>
          <RefreshCcw className="size-4" />
          Refresh
        </motion.button>
      </motion.div>

      {/* Controls */}
      <motion.div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" variants={controlsVariants} initial="hidden" animate="show">
        <motion.button whileTap={btnTap} whileHover={reduceMotion ? undefined : { y: -1 }} className="btn btn-primary flex items-center gap-2" onClick={openNewModal}>
          <Plus size={16} /> Add Project
        </motion.button>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <motion.input
            whileFocus={reduceMotion ? undefined : { scale: 1.01 }}
            transition={{ type: "spring", stiffness: 250, damping: 18, mass: 0.4 }}
            type="text"
            placeholder="Search by name or client..."
            className="input input-bordered w-full sm:w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <motion.select
            whileFocus={reduceMotion ? undefined : { scale: 1.01 }}
            transition={{ type: "spring", stiffness: 250, damping: 18, mass: 0.4 }}
            className="select select-bordered w-full sm:w-48"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as "" | Project["status"])}
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </motion.select>
        </div>
      </motion.div>

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

      {/* Loading skeletons */}
      {loading && (
        <>
          <ul className="grid grid-cols-1 gap-3 sm:gap-4 md:hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i}>
                <SkeletonCard />
              </li>
            ))}
          </ul>
          <div className="hidden md:block overflow-x-auto bg-base-100 shadow-md rounded-lg mt-2">
            <table className="min-w-full divide-y divide-base-300">
              <thead className="bg-base-200">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Client</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Amount</th>
                  <th className="px-4 py-2 text-left">Deadline</th>
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-300">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonTableRow key={i} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3">
            <Dots label="Loading projects" />
          </div>
        </>
      )}

      {/* Mobile cards */}
      {!loading && (
        <motion.ul variants={listVariants} initial="hidden" animate="show" className="grid grid-cols-1 gap-3 sm:gap-4 md:hidden">
          <AnimatePresence initial={false}>
            {filteredProjects.map((p) => (
              <motion.li key={p.id} variants={itemVariants} exit="exit">
                <motion.article whileHover={reduceMotion ? undefined : { y: -2 }} transition={{ duration: 0.15 }} className="relative rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm">
                  <div className="absolute right-3 top-3 flex items-center gap-2">
                    <span className={statusPill(p.status)}>{p.status}</span>
                  </div>

                  <header className="pr-24 mb-1 flex items-center gap-2">
                    <FolderOpen className="size-4 text-base-content/70" />
                    <h3 className="text-base font-semibold text-base-content">{p.name}</h3>
                  </header>

                  <div className="mt-1 flex items-center gap-2 text-sm text-base-content/70">
                    <User className="size-4" />
                    <span className="truncate">{p.client}</span>
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-sm text-base-content/70">
                    <DollarSign className="size-4" />
                    <span>{fmtMoney(p.amount)}</span>
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-sm text-base-content/70">
                    <Calendar className="size-4" />
                    <span>Deadline: {fmtDate(p.deadline)}</span>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <motion.button whileTap={btnTap} className="btn btn-xs btn-outline" onClick={() => handleEdit(p)} aria-label="Edit">
                      <Edit size={14} />
                      Edit
                    </motion.button>
                    <motion.button whileTap={btnTap} className="btn btn-xs btn-ghost text-error" onClick={() => handleDelete(p.id)} aria-label="Delete">
                      <Trash2 size={14} />
                      Delete
                    </motion.button>
                  </div>
                </motion.article>
              </motion.li>
            ))}
            {filteredProjects.length === 0 && (
              <motion.li variants={itemVariants} className="text-center text-base-content/60 py-4">
                No projects found.
              </motion.li>
            )}
          </AnimatePresence>
        </motion.ul>
      )}

      {/* Desktop table */}
      {!loading && filteredProjects.length > 0 && (
        <div className="hidden md:block overflow-x-auto bg-base-100 shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-base-300">
            <thead className="bg-base-200">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Client</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Deadline</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-300">
              <AnimatePresence initial={false}>
                {filteredProjects.map((project) => (
                  <motion.tr
                    key={project.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    whileHover={reduceMotion ? undefined : { backgroundColor: "var(--fallback-b1,oklch(var(--b1)))" }}
                    transition={{ duration: 0.15 }}
                    className="hover:bg-base-100"
                  >
                    <td className="px-4 py-2">{project.name}</td>
                    <td className="px-4 py-2">{project.client}</td>
                    <td className="px-4 py-2"><span className={statusPill(project.status)}>{project.status}</span></td>
                    <td className="px-4 py-2">{fmtMoney(project.amount)}</td>
                    <td className="px-4 py-2">{fmtDate(project.deadline)}</td>
                    <td className="px-4 py-2">
                      <div className="flex justify-center gap-2">
                        <motion.button whileTap={btnTap} className="btn btn-sm btn-ghost" onClick={() => handleEdit(project)} aria-label="Edit">
                          <Edit size={16} />
                        </motion.button>
                        <motion.button whileTap={btnTap} className="btn btn-sm btn-ghost text-error" onClick={() => handleDelete(project.id)} aria-label="Delete">
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {filteredProjects.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-base-content/60">
                      No projects found.
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
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              className="bg-base-100 rounded-xl w-full max-w-md p-6 relative shadow-xl"
              initial={reduceMotion ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.98, y: reduceMotion ? 0 : 8 }}
              transition={{ duration: 0.2 }}
              role="dialog"
              aria-modal="true"
              aria-label={editId ? "Edit Project" : "Add New Project"}
            >
              <motion.button
                whileTap={btnTap}
                className="absolute right-3 top-3 text-base-content/60 hover:text-base-content"
                onClick={() => { setModalOpen(false); setEditId(null); }}
                aria-label="Close"
              >
                <X size={20} />
              </motion.button>

              <h2 className="text-lg font-bold mb-4">{editId ? "Edit Project" : "Add New Project"}</h2>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <motion.input
                  whileFocus={reduceMotion ? undefined : { scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 250, damping: 18, mass: 0.4 }}
                  type="text"
                  name="name"
                  placeholder="Project Name"
                  value={formData.name}
                  required
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                />

                {/* Client from DB */}
                <motion.select
                  whileFocus={reduceMotion ? undefined : { scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 250, damping: 18, mass: 0.4 }}
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleInputChange}
                  className="select select-bordered w-full"
                  required
                >
                  <option value="">Select client…</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </motion.select>

                {/* Status */}
                <motion.select
                  whileFocus={reduceMotion ? undefined : { scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 250, damping: 18, mass: 0.4 }}
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="select select-bordered w-full"
                >
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </motion.select>

                {/* Amount */}
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text flex items-center gap-2">
                      <DollarSign className="size-4" /> Amount
                    </span>
                  </label>
                  <motion.input
                    whileFocus={reduceMotion ? undefined : { scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 250, damping: 18, mass: 0.4 }}
                    type="number"
                    name="amount"
                    min={0}
                    step="0.01"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    className="input input-bordered w-full"
                    placeholder="0.00"
                  />
                </div>

                {/* Deadline with min=today */}
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text flex items-center gap-2">
                      <Calendar className="size-4" /> Deadline
                    </span>
                  </label>
                  <motion.input
                    whileFocus={reduceMotion ? undefined : { scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 250, damping: 18, mass: 0.4 }}
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    min={todayYYYYMMDD()}
                    required
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                  />
                </div>

                <motion.button whileTap={btnTap} className="btn btn-primary mt-2" type="submit" disabled={saving}>
                  {saving ? "Saving…" : editId ? "Update Project" : "Add Project"}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
