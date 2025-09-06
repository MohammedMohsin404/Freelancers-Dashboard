"use client";

import { useState, useMemo, ChangeEvent } from "react";
import {
  Plus, Edit, Trash2, X, User, Calendar, FolderOpen,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  Variants,
} from "framer-motion";

interface Project {
  id: number;
  name: string;
  client: string;
  status: "Pending" | "In Progress" | "Completed";
  deadline: string; // ISO
}

// Seed data
const initialProjects: Project[] = [
  { id: 1, name: "Website Redesign", client: "Acme Corp",  status: "In Progress", deadline: "2025-08-31" },
  { id: 2, name: "Mobile App",       client: "Beta LLC",   status: "Completed",   deadline: "2025-07-15" },
  { id: 3, name: "Landing Page",     client: "Gamma Inc",  status: "Pending",     deadline: "2025-09-10" },
];

function statusPill(status: Project["status"]) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold sm:text-xs";
  if (status === "Pending") return `${base} bg-yellow-100 text-yellow-800`;
  if (status === "In Progress") return `${base} bg-blue-100 text-blue-800`;
  return `${base} bg-green-100 text-green-800`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.valueOf())) return iso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<Project, "id">>({
    name: "",
    client: "",
    status: "Pending",
    deadline: "",
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"" | Project["status"]>("");
  const reduceMotion = useReducedMotion();

  // Derived list
  const filteredProjects = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects
      .filter((p) => p.name.toLowerCase().includes(q) || p.client.toLowerCase().includes(q))
      .filter((p) => (filterStatus ? p.status === filterStatus : true));
  }, [projects, search, filterStatus]);

  // Form handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId !== null) {
      setProjects((prev) => prev.map((p) => (p.id === editId ? { ...p, ...formData, id: editId } : p)));
    } else {
      const newProject: Project = { ...formData, id: Date.now() };
      setProjects((prev) => [newProject, ...prev]);
    }
    setModalOpen(false);
    setFormData({ name: "", client: "", status: "Pending", deadline: "" });
    setEditId(null);
  };

  const handleEdit = (project: Project) => {
    setEditId(project.id);
    setFormData({
      name: project.name,
      client: project.client,
      status: project.status,
      deadline: project.deadline,
    });
    setModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this project?")) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "status" ? (value as Project["status"]) : value,
    }));
  };

  // Animation variants
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

  const btnTap = { scale: reduceMotion ? 1 : 0.98 };

  return (
    <div className="p-4 sm:p-6">
      {/* Header / CTA */}
      <motion.div
        className="mb-3 flex items-center gap-2"
        variants={headerVariants}
        initial="hidden"
        animate="show"
      >
        <FolderOpen className="size-5 text-primary" />
        <h2 className="text-base font-bold sm:text-lg md:text-xl">Projects</h2>
      </motion.div>

      {/* Controls */}
      <motion.div
        className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        variants={controlsVariants}
        initial="hidden"
        animate="show"
      >
        <motion.button
          whileTap={btnTap}
          whileHover={reduceMotion ? undefined : { y: -1 }}
          className="btn btn-primary flex items-center gap-2"
          onClick={() => setModalOpen(true)}
        >
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

      {/* Mobile-first CARD grid (< md) */}
      <motion.ul
        variants={listVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-3 sm:gap-4 md:hidden"
      >
        <AnimatePresence initial={false}>
          {filteredProjects.map((p) => (
            <motion.li key={p.id} variants={itemVariants} exit="exit">
              <motion.article
                whileHover={reduceMotion ? undefined : { y: -2 }}
                transition={{ duration: 0.15 }}
                className="relative rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm"
              >
                {/* Status */}
                <div className="absolute right-3 top-3">
                  <span className={statusPill(p.status)}>{p.status}</span>
                </div>

                {/* Title */}
                <header className="pr-24 mb-1 flex items-center gap-2">
                  <FolderOpen className="size-4 text-base-content/70" />
                  <h3 className="text-base font-semibold text-base-content">{p.name}</h3>
                </header>

                {/* Client */}
                <div className="mt-1 flex items-center gap-2 text-sm text-base-content/70">
                  <User className="size-4" />
                  <span className="truncate">{p.client}</span>
                </div>

                {/* Deadline */}
                <div className="mt-1 flex items-center gap-2 text-sm text-base-content/70">
                  <Calendar className="size-4" />
                  <span>Deadline: {formatDate(p.deadline)}</span>
                </div>

                {/* Actions */}
                <div className="mt-3 flex gap-2">
                  <motion.button
                    whileTap={btnTap}
                    className="btn btn-xs btn-outline"
                    onClick={() => handleEdit(p)}
                    aria-label="Edit"
                  >
                    <Edit size={14} />
                    Edit
                  </motion.button>
                  <motion.button
                    whileTap={btnTap}
                    className="btn btn-xs btn-ghost text-error"
                    onClick={() => handleDelete(p.id)}
                    aria-label="Delete"
                  >
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

      {/* Desktop TABLE (md+) */}
      <div className="hidden md:block overflow-x-auto bg-base-100 shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-base-300">
          <thead className="bg-base-200">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Client</th>
              <th className="px-4 py-2 text-left">Status</th>
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
                  <td className="px-4 py-2">
                    <span className={statusPill(project.status)}>{project.status}</span>
                  </td>
                  <td className="px-4 py-2">{formatDate(project.deadline)}</td>
                  <td className="px-4 py-2">
                    <div className="flex justify-center gap-2">
                      <motion.button
                        whileTap={btnTap}
                        className="btn btn-sm btn-ghost"
                        onClick={() => handleEdit(project)}
                        aria-label="Edit"
                      >
                        <Edit size={16} />
                      </motion.button>
                      <motion.button
                        whileTap={btnTap}
                        className="btn btn-sm btn-ghost text-error"
                        onClick={() => handleDelete(project.id)}
                        aria-label="Delete"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-base-content/60">
                    No projects found.
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
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
                onClick={() => {
                  setModalOpen(false);
                  setEditId(null);
                }}
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
                <motion.input
                  whileFocus={reduceMotion ? undefined : { scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 250, damping: 18, mass: 0.4 }}
                  type="text"
                  name="client"
                  placeholder="Client"
                  value={formData.client}
                  required
                  onChange={handleInputChange}
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
                  <option>In Progress</option>
                  <option>Completed</option>
                </motion.select>
                <motion.input
                  whileFocus={reduceMotion ? undefined : { scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 250, damping: 18, mass: 0.4 }}
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  required
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                />
                <motion.button
                  whileTap={btnTap}
                  className="btn btn-primary mt-2"
                  type="submit"
                >
                  {editId ? "Update Project" : "Add Project"}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
