// /app/components/Loader.tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils"; // <-- this now resolves

type SpinnerProps = {
  label?: string;
  className?: string;
  size?: number; // px
};

export function Spinner({ label = "Loading…", className, size = 24 }: SpinnerProps) {
  const reduce = useReducedMotion();
  const ring = {
    animate: reduce
      ? {}
      : {
          rotate: 360,
          transition: { duration: 1, ease: "linear", repeat: Infinity },
        },
  };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn("inline-flex items-center gap-2 text-base-content/70", className)}
    >
      <motion.span
        style={{
          width: size,
          height: size,
          borderWidth: Math.max(2, Math.floor(size / 12)),
        }}
        className="inline-block rounded-full border-base-300 border-t-primary"
        animate={ring.animate}
      />
      <span className="text-sm">{label}</span>
    </div>
  );
}

type PageLoaderProps = {
  label?: string;
  tip?: string;
};

export function PageLoader({ label = "Loading", tip }: PageLoaderProps) {
  const reduce = useReducedMotion();

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-base-100/80 backdrop-blur-sm">
      <div className="w-full max-w-xs rounded-2xl border border-base-300 bg-base-100 p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <Spinner label={label} />
        </div>

        {tip && (
          <motion.p
            className="mt-3 text-xs text-base-content/60"
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {tip}
          </motion.p>
        )}

        <motion.div
          className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-base-200"
          initial={reduce ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="h-full w-1/3 rounded-full bg-primary"
            initial={{ x: "-100%" }}
            animate={reduce ? {} : { x: ["-100%", "100%"] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </div>
  );
}

export function Dots({ label = "Loading", className }: { label?: string; className?: string }) {
  const reduce = useReducedMotion();
  const dot = (delay: number) =>
    reduce
      ? {}
      : {
          animate: { y: [0, -3, 0] },
          transition: { duration: 0.6, delay, repeat: Infinity, ease: "easeInOut" },
        };

  return (
    <div role="status" aria-label={label} className={cn("inline-flex items-center gap-1", className)}>
      <span className="text-sm text-base-content/70">{label}</span>
      <motion.span className="size-1.5 rounded-full bg-base-content/40" {...dot(0)} />
      <motion.span className="size-1.5 rounded-full bg-base-content/40" {...dot(0.15)} />
      <motion.span className="size-1.5 rounded-full bg-base-content/40" {...dot(0.3)} />
    </div>
  );
}
