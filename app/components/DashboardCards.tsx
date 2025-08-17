"use client";

import { motion } from "framer-motion";
import { Briefcase, Users, FileText, DollarSign } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";

const stats = [
  { title: "Total Projects", value: 24, icon: Briefcase, color: "bg-primary/10 text-primary" },
  { title: "Active Clients", value: 12, icon: Users, color: "bg-success/10 text-success" },
  { title: "Pending Invoices", value: 5, icon: FileText, color: "bg-warning/10 text-warning" },
  { title: "Earnings This Month", value: 4250, icon: DollarSign, color: "bg-accent/10 text-accent" },
];

export default function DashboardCards() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.2 }}
            whileHover={{ scale: 1.03 }}
            className="card bg-base-100 shadow-md rounded-2xl"
          >
            <div className="card-body flex flex-row items-center justify-between">
              <div>
                <p className="text-sm text-base-content/70">{stat.title}</p>
                <h2 className="text-2xl font-bold text-base-content/70">
                  {stat.title === "Earnings This Month" ? (
                    <>$<AnimatedCounter to={stat.value} duration={1.5} /></>
                  ) : (
                    <AnimatedCounter to={stat.value} duration={1.2} />
                  )}
                </h2>
              </div>
              <div className={`p-3 rounded-xl ${stat.color} flex items-center justify-center`}>
                <Icon size={24} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
