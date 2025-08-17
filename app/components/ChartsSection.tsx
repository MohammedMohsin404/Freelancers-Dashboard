"use client";

import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell,
  BarChart, Bar, Legend
} from "recharts";

const earningsData = [
  { month: "Jan", earnings: 4200 },
  { month: "Feb", earnings: 3800 },
  { month: "Mar", earnings: 5000 },
  { month: "Apr", earnings: 4500 },
  { month: "May", earnings: 6000 },
  { month: "Jun", earnings: 5500 },
];

const projectStatusData = [
  { name: "Completed", value: 18 },
  { name: "In Progress", value: 6 },
  { name: "Pending", value: 4 },
  { name: "On Hold", value: 2 },
];

const invoiceData = [
  { month: "Jan", issued: 10, paid: 8 },
  { month: "Feb", issued: 12, paid: 10 },
  { month: "Mar", issued: 8, paid: 7 },
  { month: "Apr", issued: 14, paid: 12 },
  { month: "May", issued: 9, paid: 9 },
  { month: "Jun", issued: 11, paid: 10 },
];

const COLORS = ["#22C55E", "#6366F1", "#FACC15", "#EF4444"];

export default function ChartsSection() {
  const chartCards = [
    {
      title: "Monthly Earnings",
      content: (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={earningsData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-base-300" />
            <XAxis dataKey="month" stroke="currentColor" />
            <YAxis stroke="currentColor" />
            <Tooltip formatter={(value: number) => `$${value}`} />
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
              {projectStatusData.map((entry, index) => (
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
      fullWidth: true,
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 mt-6">
      {chartCards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.2, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.2 }}
          whileHover={{ scale: 1.02 }}
          className={`card bg-base-100 shadow-md rounded-2xl ${
            card.fullWidth ? "md:col-span-2" : ""
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
