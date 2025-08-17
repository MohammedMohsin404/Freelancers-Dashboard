"use client";

import DashboardCards from "./components/DashboardCards";
import ChartsSection from "./components/ChartsSection";

export default function DashboardPage() {
  return (
    <main className="p-6 space-y-6 min-h-screen text-white">


      {/* Top Cards */}
      <DashboardCards />

      {/* Charts Section */}
      <ChartsSection />

      {/* You can add additional sections here (Projects / Invoices / Notifications) */}
    </main>
  );
}
