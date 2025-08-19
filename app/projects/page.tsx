"use client";

import { useState, useMemo, ChangeEvent } from "react";
import { Plus, Edit, Trash2, X } from "lucide-react";

interface Project {
  id: number;
  name: string;
  client: string;
  status: "Pending" | "In Progress" | "Completed";
  deadline: string;
}

// Dummy JSON data
const initialProjects: Project[] = [
  { id: 1, name: "Website Redesign", client: "Acme Corp", status: "In Progress", deadline: "2025-08-31" },
  { id: 2, name: "Mobile App", client: "Beta LLC", status: "Completed", deadline: "2025-07-15" },
  { id: 3, name: "Landing Page", client: "Gamma Inc", status: "Pending", deadline: "2025-09-10" },
];

export default function ProjectsPage() {
  const [ projects, setProjects ] = useState<Project[]>(initialProjects);
  const [ modalOpen, setModalOpen ] = useState(false);
  const [ formData, setFormData ] = useState<Omit<Project, "id">>({
    name: "",
    client: "",
    status: "Pending",
    deadline: "",
  });
  const [ editId, setEditId ] = useState<number | null>(null);
  const [ search, setSearch ] = useState("");
  const [ filterStatus, setFilterStatus ] = useState<"" | Project[ "status" ]>("");

  // Filtered and searched projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.client.toLowerCase().includes(search.toLowerCase())
      )
      .filter((p) => (filterStatus ? p.status === filterStatus : true));
  }, [ projects, search, filterStatus ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId !== null) {
      // Edit existing project
      setProjects(
        projects.map((p) => (p.id === editId ? { ...p, ...formData, id: editId } : p))
      );
    } else {
      // Add new project (prepend to show last first)
      const newProject: Project = { ...formData, id: Date.now() };
      setProjects([ newProject, ...projects ]);
    }
    setModalOpen(false);
    setFormData({ name: "", client: "", status: "Pending", deadline: "" });
    setEditId(null);
  };

  const handleEdit = (project: Project) => {
    setEditId(project.id);
    setFormData({ name: project.name, client: project.client, status: project.status, deadline: project.deadline });
    setModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this project?")) {
      setProjects(projects.filter((p) => p.id !== id));
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      status: name === "status" ? (value as Project[ "status" ]) : prev.status,
      [ name ]: name === "deadline" ? value : value,
    }));
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <button className="btn btn-primary flex items-center gap-2" onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Add Project
        </button>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <input
            type="text"
            placeholder="Search by name or client..."
            className="input input-bordered w-full sm:w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="select select-bordered w-full sm:w-48"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as "" | Project[ "status" ])}
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Projects Table */}
      <div className="overflow-x-auto bg-base-100 shadow-md rounded-lg">
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
            {filteredProjects.map((project) => (
              <tr key={project.id} className="hover:bg-base-100">
                <td className="px-4 py-2">{project.name}</td>
                <td className="px-4 py-2">{project.client}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-full ${project.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : project.status === "In Progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                  >
                    {project.status}
                  </span>
                </td>

                <td className="px-4 py-2">{project.deadline}</td>
                <td className="px-4 py-2 flex justify-center gap-2">
                  <button className="btn btn-sm btn-ghost" onClick={() => handleEdit(project)}>
                    <Edit size={16} />
                  </button>
                  <button className="btn btn-sm btn-ghost text-error" onClick={() => handleDelete(project.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredProjects.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-4 text-base-content/60">
                  No projects found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-xl w-full max-w-md p-6 relative">
            <button
              className="absolute top-3 right-3 text-base-content/50 hover:text-base-content"
              onClick={() => { setModalOpen(false); setEditId(null); }}
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-bold mb-4">{editId ? "Edit Project" : "Add New Project"}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                name="name"
                placeholder="Project Name"
                value={formData.name}
                required
                onChange={handleInputChange}
                className="input input-bordered w-full"
              />
              <input
                type="text"
                name="client"
                placeholder="Client"
                value={formData.client}
                required
                onChange={handleInputChange}
                className="input input-bordered w-full"
              />
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="select select-bordered w-full"
              >
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                required
                onChange={handleInputChange}
                className="input input-bordered w-full"
              />
              <button type="submit" className="btn btn-primary mt-2">
                {editId ? "Update Project" : "Add Project"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
