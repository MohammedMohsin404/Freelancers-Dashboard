"use client";


import { Bell } from "lucide-react";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  const [notifications] = useState([
    { id: 1, text: "New project assigned", time: "2m ago" },
    { id: 2, text: "Invoice #123 paid", time: "1h ago" },
    { id: 3, text: "Client feedback received", time: "3h ago" },
  ]);

  return (
    <header className="h-14 sm:h-16 lg:h-18 bg-base-100 border-b border-base-300 flex items-center justify-between px-3 sm:px-4 lg:px-6 shadow-sm">
      {/* Left: Logo / Brand */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div>
          <span className="font-bold text-base text-base-content sm:hidden">
            Freelancers Dashboard
          </span>
          <span className="hidden sm:block md:hidden font-bold text-lg text-base-content">
            Freelancers Dashboard
          </span>
          <span className="hidden md:block font-bold text-lg text-base-content">
            Freelancers Dashboard
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-sm sm:btn-md p-2 relative">
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="badge badge-error badge-xs absolute -top-1 -right-1">
                {notifications.length > 9 ? "9+" : notifications.length}
              </span>
            )}
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box shadow-lg border border-base-300 w-72 sm:w-80 mt-2 p-0 z-50"
          >
            <div className="p-3 border-b border-base-300">
              <h3 className="font-semibold text-sm text-base-content">Notifications</h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.map((n) => (
                <li key={n.id} className="border-b border-base-300 last:border-b-0">
                  <a className="p-3 hover:bg-base-200">
                    <span className="text-sm font-medium">{n.text}</span>
                    <span className="text-xs text-base-content/60">{n.time}</span>
                  </a>
                </li>
              ))}
            </div>
          </ul>
        </div>

        {/* User Avatar Dropdown */}
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-circle btn-sm sm:btn-md p-1.5 flex items-center gap-2">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || "User"}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-bold">U</span>
              </div>
            )}
            
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box shadow-lg border border-base-300 w-44 sm:w-48 mt-2 p-2 z-50"
          >
            {session?.user?.name && <span className="hidden sm:inline text-sm font-medium"> <li>{session.user.name}</li></span>}
           
            <Link href="/settings"><li>Settings</li></Link>
            <div className="divider my-1"></div>
            <li>
              <button
                className="text-error w-full text-left"
                onClick={() => signOut({ callbackUrl: "/auth/login" })}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
