// /app/api/stats/route.ts
import { NextResponse } from "next/server";
import { clientsCollection, invoicesCollection, projectsCollection } from "@/lib/collections";

/** Helper to return consistent JSON errors */
function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: { message, ...extra } }, { status });
}

/**
 * GET /api/stats
 * Returns:
 *  - totalProjects: number
 *  - activeClients: number   (clients with totalProjects > 0; falls back to all clients if that field is missing)
 *  - pendingInvoices: number
 *  - earningsThisMonth: number (sum of PAID invoices in current month)
 */
export async function GET() {
  try {
    const [projectsCol, clientsCol, invoicesCol] = await Promise.all([
      projectsCollection(),
      clientsCollection(),
      invoicesCollection(),
    ]);

    // Totals
    const [totalProjects, totalClients] = await Promise.all([
      projectsCol.countDocuments({}),
      clientsCol.countDocuments({}),
    ]);

    // Prefer counting clients with totalProjects > 0 when field exists;
    // otherwise fall back to "clients that have at least one project".
    const activeFromField = await clientsCol.countDocuments({ totalProjects: { $gt: 0 } });
   const activeClients =
  activeFromField > 0
    ? activeFromField
    : await projectsCol
        .aggregate<{ cnt: number }>([
          { $group: { _id: "$clientId" } },
          { $count: "cnt" },
        ])
        .toArray()
        .then((r) => (r?.[0]?.cnt ?? 0));

    // Pending invoices
    const pendingInvoices = await invoicesCol.countDocuments({ status: "Pending" });

    // Earnings (paid) this month
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const earningsAgg = await invoicesCol
      .aggregate<{ total: number }>([
        {
          $match: {
            status: "Paid",
            createdAt: { $gte: start, $lt: end },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ])
      .toArray();

    const earningsThisMonth = Number(earningsAgg?.[0]?.total ?? 0);

    return NextResponse.json({
      totalProjects,
      activeClients,
      pendingInvoices,
      earningsThisMonth,
    });
  } catch (err: any) {
    console.error("[GET /api/stats] Failed:", err);
    return jsonError("Failed to load stats", 500);
  }
}
