"use client";

import { useState, useMemo, ChangeEvent } from "react";
import { Plus, Edit, Trash2, X } from "lucide-react";
import Modal from "../components/Modal";

interface Invoice {
  id: number;
  invoiceId: string;
  client: string;
  amount: number;
  status: "Paid" | "Pending";
}

// Dummy data
const initialInvoices: Invoice[] = [
  { id: 1, invoiceId: "INV-1001", client: "Acme Corp", amount: 1200, status: "Pending" },
  { id: 2, invoiceId: "INV-1002", client: "Beta LLC", amount: 800, status: "Paid" },
  { id: 3, invoiceId: "INV-1003", client: "Gamma Inc", amount: 450, status: "Pending" },
];

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

  const filteredInvoices = useMemo(() => {
    return invoices
      .filter(i =>
        i.invoiceId.toLowerCase().includes(search.toLowerCase()) ||
        i.client.toLowerCase().includes(search.toLowerCase())
      )
      .filter(i => (filterStatus ? i.status === filterStatus : true));
  }, [invoices, search, filterStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId !== null) {
      setInvoices(invoices.map(i => i.id === editId ? { ...i, ...formData, id: editId } : i));
    } else {
      setInvoices([{ ...formData, id: Date.now() }, ...invoices]);
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
      setInvoices(invoices.filter(i => i.id !== id));
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      status: name === "status" ? (value as Invoice["status"]) : prev.status,
      [name]: name === "amount" ? Number(value) : value,
    }));
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <button className="btn btn-primary flex items-center gap-2" onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Add Invoice
        </button>

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
            {filteredInvoices.map(invoice => (
              <tr key={invoice.id} className="hover:bg-base-100">
                <td className="px-4 py-2">{invoice.invoiceId}</td>
                <td className="px-4 py-2">{invoice.client}</td>
                <td className="px-4 py-2">${invoice.amount}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-full ${invoice.status === "Paid"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                      }`}
                  >
                    {invoice.status}
                  </span>
                </td>
                <td className="px-4 py-2 flex justify-center gap-2">
                  <button className="btn btn-sm btn-ghost" onClick={() => handleEdit(invoice)}><Edit size={16} /></button>
                  <button className="btn btn-sm btn-ghost text-error" onClick={() => handleDelete(invoice.id)}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {filteredInvoices.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-4 text-base-content/60">No invoices found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <Modal title={editId ? "Edit Invoice" : "Add New Invoice"} onClose={() => { setModalOpen(false); setEditId(null); }}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input type="text" name="invoiceId" placeholder="Invoice ID" value={formData.invoiceId} onChange={handleInputChange} required className="input input-bordered w-full" />
            <input type="text" name="client" placeholder="Client" value={formData.client} onChange={handleInputChange} required className="input input-bordered w-full" />
            <input type="number" name="amount" placeholder="Amount" value={formData.amount} onChange={handleInputChange} required className="input input-bordered w-full" />
            <select name="status" value={formData.status} onChange={handleInputChange} className="select select-bordered w-full">
              <option>Pending</option>
              <option>Paid</option>
            </select>
            <button type="submit" className="btn btn-primary mt-2">{editId ? "Update Invoice" : "Add Invoice"}</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
