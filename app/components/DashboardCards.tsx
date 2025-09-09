// /app/components/DashboardCards.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Users, FileText, DollarSign } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";

type Stats = {
  totalProjects: number;
  activeClients: number;
  pendingInvoices: number;
  earningsThisMonth: number;
};

export default function DashboardCards() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/stats", { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to load stats (${res.status})`);
        const data = (await res.json()) as Stats;
        if (alive) setStats(data);
      } catch (e) {
        console.error(e);
        if (alive) setStats({
          totalProjects: 0,
          activeClients: 0,
          pendingInvoices: 0,
          earningsThisMonth: 0,
        });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const cards = [
    {
      title: "Total Projects",
      value: stats?.totalProjects ?? 0,
      icon: Briefcase,
      color: "bg-primary/10 text-primary",
      isMoney: false,
    },
    {
      title: "Active Clients",
      value: stats?.activeClients ?? 0,
      icon: Users,
      color: "bg-success/10 text-success",
      isMoney: false,
    },
    {
      title: "Pending Invoices",
      value: stats?.pendingInvoices ?? 0,
      icon: FileText,
      color: "bg-warning/10 text-warning",
      isMoney: false,
    },
    {
      title: "Earnings This Month",
      value: stats?.earningsThisMonth ?? 0,
      icon: DollarSign,
      color: "bg-accent/10 text-accent",
      isMoney: true,
    },
  ] as const;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.12, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.2 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="card bg-base-100 shadow-md rounded-2xl hover:shadow-lg transition-shadow duration-200"
          >
            <div className="card-body p-4 sm:p-5 lg:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between">
              {/* Text Section */}
              <div className="flex-1 min-w-0 mb-3 sm:mb-0">
                <p className="text-xs sm:text-sm lg:text-base text-base-content/70 font-medium mb-1 lg:mb-2">
                  {card.title}
                </p>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-base-content truncate">
                  {card.isMoney ? (
                    loading ? (
                      <>$0</>
                    ) : (
                      <>${<AnimatedCounter to={card.value} duration={1.2} />}</>
                    )
                  ) : loading ? (
                    0
                  ) : (
                    <AnimatedCounter to={card.value} duration={1.0} />
                  )}
                </h2>
              </div>

              {/* Icon Section */}
              <div
                className={`p-2.5 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl ${card.color} flex items-center justify-center flex-shrink-0`}
                aria-hidden="true"
              >
                <Icon className="w-5 h-5 lg:w-6 lg:h-6" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
