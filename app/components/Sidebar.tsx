"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Users,
  Settings,
  Menu,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Projects", icon: FolderKanban, href: "/projects" },
  { name: "Invoices", icon: FileText, href: "/invoices" },
  { name: "Clients", icon: Users, href: "/clients" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* --- Desktop Sidebar (Collapsible) --- */}
      <aside
        className={`hidden lg:flex h-screen bg-base-200 text-base-content transition-all duration-300 
        ${collapsed ? "w-16" : "w-60"} flex-col`}
      >
        {/* Top Section */}
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          {!collapsed && <h1 className="text-lg font-bold">Freelancer</h1>}
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto">
          <ul className="menu px-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg p-2 
                      ${active ? "bg-primary text-white" : "hover:bg-base-300"}`}
                    title={collapsed ? item.name : undefined}
                  >
                    <Icon size={20} />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* --- Mobile Bottom Nav --- */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-base-200 border-t border-base-300 flex justify-around items-center py-2 z-50">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center text-xs px-2 py-1 ${
                active ? "text-primary" : "text-base-content"
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px]">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
