"use client";

import { useState, useMemo, ChangeEvent } from "react";
import { Plus, Edit, Trash2, X } from "lucide-react";
import Modal from "../components/Modal";

interface Client {
  id: number;
  name: string;
  email: string;
  company: string;
  totalProjects: number;
}

// Dummy data
const initialClients: Client[] = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", company: "Acme Corp", totalProjects: 5 },
  { id: 2, name: "Bob Smith", email: "bob@example.com", company: "Beta LLC", totalProjects: 2 },
  { id: 3, name: "Charlie Lee", email: "charlie@example.com", company: "Gamma Inc", totalProjects: 3 },
];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<Client, "id">>({
    name: "",
    email: "",
    company: "",
    totalProjects: 0,
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const filteredClients = useMemo(() => {
    return clients.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase())
    );
  }, [clients, search]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId !== null) {
      setClients(clients.map(c => c.id === editId ? { ...c, ...formData, id: editId } : c));
    } else {
      const newClient = { ...formData, id: Date.now() };
      setClients([newClient, ...clients]);
    }
    setModalOpen(false);
    setFormData({ name: "", email: "", company: "", totalProjects: 0 });
    setEditId(null);
  };

  const handleEdit = (client: Client) => {
    setEditId(client.id);
    setFormData({ name: client.name, email: client.email, company: client.company, totalProjects: client.totalProjects });
    setModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this client?")) {
      setClients(clients.filter(c => c.id !== id));
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "totalProjects" ? Number(value) : value,
    }));
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <button className="btn btn-primary flex items-center gap-2" onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Add Client
        </button>

        <input
          type="text"
          placeholder="Search by name, email, or company..."
          className="input input-bordered w-full sm:w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto bg-base-100 shadow-md rounded-lg">
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
            {filteredClients.map(client => (
              <tr key={client.id} className="hover:bg-base-100">
                <td className="px-4 py-2">{client.name}</td>
                <td className="px-4 py-2">{client.email}</td>
                <td className="px-4 py-2">{client.company}</td>
                <td className="px-4 py-2">{client.totalProjects}</td>
                <td className="px-4 py-2 flex justify-center gap-2">
                  <button className="btn btn-sm btn-ghost" onClick={() => handleEdit(client)}><Edit size={16} /></button>
                  <button className="btn btn-sm btn-ghost text-error" onClick={() => handleDelete(client.id)}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {filteredClients.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-4 text-base-content/60">No clients found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <Modal title={editId ? "Edit Client" : "Add New Client"} onClose={() => { setModalOpen(false); setEditId(null); }}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} required className="input input-bordered w-full" />
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} required className="input input-bordered w-full" />
            <input type="text" name="company" placeholder="Company" value={formData.company} onChange={handleInputChange} required className="input input-bordered w-full" />
            <input type="number" name="totalProjects" placeholder="Total Projects" value={formData.totalProjects} onChange={handleInputChange} required className="input input-bordered w-full" />
            <button type="submit" className="btn btn-primary mt-2">{editId ? "Update Client" : "Add Client"}</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
