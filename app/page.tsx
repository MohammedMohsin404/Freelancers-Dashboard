"use client";

import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-50 via-white to-blue-50 px-4 sm:px-6">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 sm:p-12 space-y-6">
        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 text-center">
          Welcome to <span className="text-indigo-600">Freelancers Dashboard</span>
        </h1>

        {/* Subheading */}
        <p className="text-gray-500 text-center text-base sm:text-lg">
          Manage your projects, track clients, and stay productive — all in one place.
        </p>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
          <div className="p-4 rounded-xl bg-indigo-50 text-center">
            <h3 className="font-semibold text-indigo-700">Projects</h3>
            <p className="text-xs text-gray-500 mt-1">Organize your freelance work</p>
          </div>
          <div className="p-4 rounded-xl bg-blue-50 text-center">
            <h3 className="font-semibold text-blue-700">Clients</h3>
            <p className="text-xs text-gray-500 mt-1">Manage relationships with ease</p>
          </div>
          <div className="p-4 rounded-xl bg-purple-50 text-center">
            <h3 className="font-semibold text-purple-700">Invoices</h3>
            <p className="text-xs text-gray-500 mt-1">Track progress and income</p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex justify-center pt-4">
          <button className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium shadow hover:bg-indigo-700 transition">
            <Link href="/dashboard">Go to Dashboard</Link>
          </button>
        </div>
      </div>
    </main>
  );
}
