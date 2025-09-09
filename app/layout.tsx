// /app/layout.tsx
"use client";
import Sidebar from "./components/Sidebar";
import NProgressClient from "./components/NProgressClient";
import Header from "./components/Header";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Put SessionProvider inside <body>, not <html> */}
      <body>
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="light">
            <NProgressClient />
            <div className="flex h-screen">
              <Sidebar />
              <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 bg-base-200 p-6 overflow-y-auto">{children}</main>
              </div>
            </div>
            <Toaster
              position="top-right"
              toastOptions={{
                success: { className: "bg-green-100 text-green-800 border border-green-300" },
                error: { className: "bg-red-100 text-red-800 border border-red-300" },
              }}
            />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
