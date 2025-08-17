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
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
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
            whileTap={{ scale: 0.98 }}
            className="card bg-base-100 shadow-md rounded-2xl hover:shadow-lg transition-shadow duration-200"
          >
            <div className="card-body p-4 sm:p-5 lg:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between">
              {/* Text Section */}
              <div className="flex-1 min-w-0 mb-3 sm:mb-0">
                <p className="text-xs sm:text-sm lg:text-base text-base-content/70 font-medium mb-1 lg:mb-2">
                  {stat.title}
                </p>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-base-content truncate">
                  {stat.title === "Earnings This Month" ? (
                    <>${<AnimatedCounter to={stat.value} duration={1.5} />}</>
                  ) : (
                    <AnimatedCounter to={stat.value} duration={1.2} />
                  )}
                </h2>
              </div>

              {/* Icon Section */}
              <div
                className={`p-2.5 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl ${stat.color} flex items-center justify-center flex-shrink-0`}
              >
                <Icon size={20} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
