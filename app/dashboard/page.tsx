// app/page.tsx (or app/dashboard/page.tsx)
// import DashboardCards from "./components/DashboardCards";

import DashboardCards from "../components/DashboardCards";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardCards />
      {/* More dashboard content like charts, recent activity, etc. */}
    </div>
  );
}
