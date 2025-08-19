// app/layout.tsx
"use client"
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  return (
    <html lang="en" suppressHydrationWarning>
 <SessionProvider>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light">
          <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
              <Header />
              <main className="flex-1 bg-base-200 p-6 overflow-y-auto">
                {children}
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
      </SessionProvider>
    </html>
  );
}
