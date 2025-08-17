"use client";

import { useTheme } from "next-themes";
import { Bell, Sun, Moon } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [notifications] = useState([
    { id: 1, text: "New project assigned" },
    { id: 2, text: "Invoice #123 paid" },
    { id: 3, text: "Client feedback received" },
  ]);

  return (
    <header className="h-16 bg-base-100 border-b border-base-300 flex items-center justify-between px-4 shadow-sm">
      {/* Left: Logo */}
      <div className="flex items-center gap-2">
        {/* <Image src="/logo.png" alt="Logo" width={32} height={32} /> */}
        <span className="font-bold text-lg hidden md:block">Freelancers Dashboard</span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>
<ThemeToggle/>
        {/* Notifications */}
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-sm relative">
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="badge badge-error badge-xs absolute -top-1 -right-1">
                {notifications.length}
              </span>
            )}
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box shadow w-64 mt-2 p-2"
          >
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <li key={n.id} className="text-sm">
                  {n.text}
                </li>
              ))
            ) : (
              <li className="text-sm text-gray-400">No notifications</li>
            )}
          </ul>
        </div>

        {/* User Avatar Dropdown */}
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
            <div className="w-8 rounded-full">
              <Image
                src="/avatar.png"
                alt="User Avatar"
                width={32}
                height={32}
              />
            </div>
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box shadow w-40 mt-3 p-2"
          >
            <li>
              <a>Profile</a>
            </li>
            <li>
              <a>Settings</a>
            </li>
            <li>
              <a className="text-error">Logout</a>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
