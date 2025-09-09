"use client";

import ChartsSection from "../components/ChartsSection";
import DashboardCards from "../components/DashboardCards";
import Invoices from "../components/Invoices";
import Noctie from "../components/Noctie";
import Notifications from "../components/Notifications";
import Projects from "../components/Projects";



export default function Page() {
  return (
    <main className="p-4 sm:p-6 space-y-6 min-h-screen">
      {/* Top Cards */}
      <DashboardCards />

      {/* Charts Section */}
      <ChartsSection />

      {/* Projects + Invoices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Projects - take 2/3 on desktop */}
        <div className="md:col-span-2 h-full">
          <Projects />
        </div>
        {/* Invoices - take 1/3 on desktop */}
        <div className="md:col-span-1 h-full">
          <Invoices />
        </div>
      </div>

      {/* Notifications + Noctie */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch"> */}
        {/* Notifications - take 2/3 on desktop */}
        {/* <div className="md:col-span-2 h-full">
          <Notifications />
        </div> */}
        {/* Noctie - take 1/3 on desktop */}
        {/* <div className="md:col-span-1 h-full">
          <Noctie />
        </div>
      </div> */}
    </main>
  );
}
