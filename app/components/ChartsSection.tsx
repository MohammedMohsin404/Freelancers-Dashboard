"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell,
  BarChart, Bar, Legend
} from "recharts";
import { Dots } from "@/app/components/Loader";
import type { ReactNode } from "react";
type Invoice = {
  id: string;
  invoiceId: string;
  client: string;
  clientId?: string;
  amount: number;
  status: "Paid" | "Pending";
  createdAt?: string; // ISO
};

type Project = {
  id: string;
  name: string;
  client: string;
  clientId?: string;
  status: "Pending" | "In Progress" | "Completed";
  amount: number;
  deadline: string;
  createdAt?: string;
};

type MonthKey = `${number}-${number}`; // e.g., "2025-1"

const COLORS = ["#22C55E", "#6366F1", "#FACC15", "#EF4444"];

// Helpers
function monthLabel(date: Date) {
  return date.toLocaleString(undefined, { month: "short" });
}
function monthKey(date: Date): MonthKey {
  return `${date.getFullYear()}-${date.getMonth() + 1}`;
}
function* lastNMonths(n: number) {
  const d = new Date();
  d.setDate(1);
  for (let i = n - 1; i >= 0; i--) {
    const dt = new Date(d.getFullYear(), d.getMonth() - i, 1);
    yield dt;
  }
}

type EarningsPoint = { month: string; earnings: number };
type InvoicePoint = { month: string; issued: number; paid: number };

// Uniform card type so `fullWidth` always exists
type ChartCard = {
  title: string;
  content: ReactNode;
  fullWidth: boolean;
};

export default function ChartsSection() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const [invRes, projRes] = await Promise.all([
          fetch("/api/invoices", { cache: "no-store" }),
          fetch("/api/projects", { cache: "no-store" }),
        ]);
        if (!invRes.ok) throw new Error(`Failed to load invoices (${invRes.status})`);
        if (!projRes.ok) throw new Error(`Failed to load projects (${projRes.status})`);

        const invData: Invoice[] = await invRes.json();
        const projData: Project[] = await projRes.json();

        if (!alive) return;
        setInvoices(invData);
        setProjects(projData);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Failed to load dashboard charts");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // ===== Compute chart data =====
  const { earningsData, invoiceData } = useMemo(() => {
    const sixMonths = Array.from(lastNMonths(6));
    const issuedMap = new Map<MonthKey, number>();
    const paidMap = new Map<MonthKey, number>();
    const earningsMap = new Map<MonthKey, number>();

    sixMonths.forEach((d) => {
      issuedMap.set(monthKey(d), 0);
      paidMap.set(monthKey(d), 0);
      earningsMap.set(monthKey(d), 0);
    });

    for (const inv of invoices) {
      const created = inv.createdAt ? new Date(inv.createdAt) : null;
      if (!created || isNaN(+created)) continue;
      const bucket = new Date(created.getFullYear(), created.getMonth(), 1);
      const key = monthKey(bucket);
      if (!issuedMap.has(key)) continue;

      issuedMap.set(key, (issuedMap.get(key) || 0) + 1);

      if (inv.status === "Paid") {
        paidMap.set(key, (paidMap.get(key) || 0) + 1);
        const amt = Number.isFinite(inv.amount) ? inv.amount : 0;
        earningsMap.set(key, (earningsMap.get(key) || 0) + amt);
      }
    }

    const _earningsData: EarningsPoint[] = sixMonths.map((d) => ({
      month: monthLabel(d),
      earnings: Number(earningsMap.get(monthKey(d)) || 0),
    }));

    const _invoiceData: InvoicePoint[] = sixMonths.map((d) => ({
      month: monthLabel(d),
      issued: Number(issuedMap.get(monthKey(d)) || 0),
      paid: Number(paidMap.get(monthKey(d)) || 0),
    }));

    return { earningsData: _earningsData, invoiceData: _invoiceData };
  }, [invoices]);

  const projectStatusData = useMemo(() => {
    const counts = new Map<string, number>([
      ["Completed", 0],
      ["In Progress", 0],
      ["Pending", 0],
    ]);

    for (const p of projects) {
      const key = p.status || "Pending";
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
  }, [projects]);

  // ===== Render =====
  if (loading) {
    return (
      <div className="mt-6">
        <Dots label="Loading charts" />
      </div>
    );
  }

  if (err) {
    return (
      <div className="mt-6 alert alert-error">
        <span>{err}</span>
      </div>
    );
  }

  const chartCards: ChartCard[] = [
    {
      title: "Monthly Earnings",
      fullWidth: false,
      content: (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={earningsData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-base-300" />
            <XAxis dataKey="month" stroke="currentColor" />
            <YAxis stroke="currentColor" />
            <Tooltip formatter={(value: any) => `$${Number(value ?? 0).toFixed(2)}`} />
            <Line
              type="monotone"
              dataKey="earnings"
              stroke="#4F46E5"
              strokeWidth={2}
              dot={{ r: 5 }}
              activeDot={{ r: 8 }}
              isAnimationActive
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: "Project Status",
      fullWidth: false,
      content: (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={projectStatusData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label
              isAnimationActive
              animationDuration={1500}
            >
              {projectStatusData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: "Invoice Trends",
      fullWidth: true,
      content: (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={invoiceData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-base-300" />
            <XAxis dataKey="month" stroke="currentColor" />
            <YAxis stroke="currentColor" />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="issued"
              fill="#6366F1"
              radius={[6, 6, 0, 0]}
              isAnimationActive
              animationDuration={1500}
            />
            <Bar
              dataKey="paid"
              fill="#22C55E"
              radius={[6, 6, 0, 0]}
              isAnimationActive
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
      {chartCards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.2, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.2 }}
          whileHover={{ scale: 1.02 }}
          className={`card bg-base-100 shadow-md rounded-2xl ${
            card.fullWidth ? "sm:col-span-2" : ""
          }`}
        >
          <div className="card-body">
            <h2 className="text-lg font-semibold mb-4">{card.title}</h2>
            {card.content}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
