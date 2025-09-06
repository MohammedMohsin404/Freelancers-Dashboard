"use client";

// /app/components/Projects.tsx
import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Calendar, User, FolderOpen } from "lucide-react";

type ProjectStatus = "Active" | "Completed" | "Overdue";

interface Project {
  id: string;
  name: string;
  client: string;
  status: ProjectStatus;
  deadline: string; // ISO date
}

const projects: Project[] = [
  { id: "1", name: "Website Redesign", client: "Client A", status: "Active",    deadline: "2024-05-20" },
  { id: "2", name: "Mobile App",        client: "Client B", status: "Completed", deadline: "2024-04-15" },
  { id: "3", name: "Branding Project",  client: "Client C", status: "Overdue",   deadline: "2024-03-10" },
  { id: "4", name: "Blog Post Series",  client: "Client D", status: "Active",    deadline: "2024-06-01" },
];

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.valueOf())) return iso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

function statusBadgeClasses(status: ProjectStatus) {
  const base = "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold text-white sm:text-xs";
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

export default function Projects() {
  const reduceMotion = useReducedMotion();

  // Minimal motion: fade + slight rise; disabled when user prefers reduced motion
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

      {/* Mobile-first card grid; scales up by breakpoints */}
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
                <button
                  className="btn btn-xs sm:btn-sm btn-outline"
                  type="button"
                  aria-label={`View details for ${p.name}`}
                >
                  Details
                </button>
                <button
                  className="btn btn-xs sm:btn-sm btn-primary"
                  type="button"
                  aria-label={`Open ${p.name}`}
                >
                  Open
                </button>
              </div>

              {/* Subtle hover lift on larger screens only */}
              {!reduceMotion && (
                <div className="pointer-events-none absolute inset-0 rounded-xl ring-0 transition-transform duration-200 md:group-hover:-translate-y-0.5" />
              )}
            </article>
          </motion.li>
        ))}
      </motion.ul>
    </motion.section>
  );
}
