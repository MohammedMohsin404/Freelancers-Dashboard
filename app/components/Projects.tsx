"use client";

// /app/components/Projects.tsx
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Calendar, User, FolderOpen } from "lucide-react";
import { Dots } from "@/app/components/Loader";

type ApiStatus = "Pending" | "In Progress" | "Completed";
type ProjectStatus = "Active" | "Completed" | "Overdue";

type ApiProject = {
  id: string;
  name: string;
  client: string;      // display name from API
  clientId?: string;
  status: ApiStatus;
  amount: number;
  deadline: string;    // ISO date
  createdAt?: string;
  updatedAt?: string;
};

type Project = {
  id: string;
  name: string;
  client: string;
  status: ProjectStatus;
  deadline: string; // ISO date
};

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.valueOf())) return iso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

function statusBadgeClasses(status: ProjectStatus) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold text-white sm:text-xs";
  switch (status) {
    case "Active":
      return `${base} bg-success`;
    case "Completed":
      return `${base} bg-warning`;
    case "Overdue":
      return `${base} bg-error`;
    default:
      return `${base} bg-neutral/60`;
  }
}

// Compute UI status from API status + deadline
function computeStatus(apiStatus: ApiStatus, deadlineISO: string): ProjectStatus {
  if (apiStatus === "Completed") return "Completed";
  const d = new Date(deadlineISO);
  const today = new Date();
  d.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return d < today ? "Overdue" : "Active";
}

export default function Projects() {
  const reduceMotion = useReducedMotion();

  const [raw, setRaw] = useState<ApiProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch("/api/projects", { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to load projects (${res.status})`);
        const data: ApiProject[] = await res.json();
        if (!alive) return;
        setRaw(data);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Failed to load projects");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const projects: Project[] = useMemo(
    () =>
      raw.map((p) => ({
        id: p.id,
        name: p.name,
        client: p.client,
        deadline: p.deadline,
        status: computeStatus(p.status, p.deadline),
      })),
    [raw]
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: reduceMotion ? {} : { staggerChildren: 0.06, delayChildren: 0.04 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  };

  return (
    <motion.section
      aria-labelledby="projects-title"
      className="rounded-xl bg-base-200 p-4 sm:p-6 shadow-lg"
      initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="mb-3 flex items-center gap-2 sm:mb-4">
        <FolderOpen className="size-5 text-primary" />
        <h2 id="projects-title" className="text-base font-bold text-base-content sm:text-lg md:text-xl">
          Projects
        </h2>
      </div>

      {loading && (
        <div className="py-4">
          <Dots label="Loading projects" />
        </div>
      )}

      {err && !loading && (
        <div className="alert alert-error mb-3">
          <span>{err}</span>
        </div>
      )}

      {!loading && !err && (
        <motion.ul
          variants={container}
          initial="hidden"
          animate="show"
          className="
            grid grid-cols-1 gap-3
            sm:gap-4
            md:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
          "
        >
          {projects.map((p) => (
            <motion.li key={p.id} variants={item}>
              <article
                className="
                  group relative rounded-xl border border-base-300 bg-base-100 p-4
                  shadow-sm transition
                  hover:shadow-md focus-within:shadow-md
                "
                tabIndex={-1}
                aria-labelledby={`proj-${p.id}-title`}
              >
                {/* Status pill */}
                <div className="absolute right-3 top-3">
                  <span className={statusBadgeClasses(p.status)}>{p.status}</span>
                </div>

                {/* Title */}
                <header className="pr-20">
                  <h3
                    id={`proj-${p.id}-title`}
                    className="line-clamp-2 text-base font-semibold text-base-content sm:text-lg"
                  >
                    {p.name}
                  </h3>
                </header>

                {/* Client */}
                <div className="mt-2 flex items-center gap-2 text-sm text-base-content/70">
                  <User className="size-4 shrink-0" />
                  <span className="truncate">{p.client}</span>
                </div>

                {/* Deadline */}
                <div className="mt-2 flex items-center gap-2 text-sm text-base-content/70">
                  <Calendar className="size-4 shrink-0" />
                  <span className="truncate">Deadline: {formatDate(p.deadline)}</span>
                </div>

                {/* Actions */}
                <div className="mt-3 flex gap-2">
                  <Link
                    href={`/projects/${p.id}`}
                    className="btn btn-xs sm:btn-sm btn-outline"
                    aria-label={`View details for ${p.name}`}
                  >
                    Details
                  </Link>

                  <Link
                    href={`/projects/${p.id}/edit`}
                    className="btn btn-xs sm:btn-sm btn-primary"
                    aria-label={`Open ${p.name} editor`}
                  >
                    Open
                  </Link>
                </div>

                {/* Subtle hover lift on larger screens only */}
                {!reduceMotion && (
                  <div className="pointer-events-none absolute inset-0 rounded-xl ring-0 transition-transform duration-200 md:group-hover:-translate-y-0.5" />
                )}
              </article>
            </motion.li>
          ))}

          {projects.length === 0 && (
            <li className="text-center text-base-content/60 py-4 col-span-full">
              No projects found.
            </li>
          )}
        </motion.ul>
      )}
    </motion.section>
  );
}
