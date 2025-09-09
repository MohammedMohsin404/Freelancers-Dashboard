// /app/components/NProgressClient.tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

export default function NProgressClient() {
  const pathname = usePathname();

  useEffect(() => {
    // Configure once
    NProgress.configure({
      showSpinner: false,
      trickleSpeed: 120,
      speed: 300,
      minimum: 0.08,
    });
  }, []);

  useEffect(() => {
    // Pulse the bar on every pathname change
    // (App Router doesn't expose start/complete events like pages router)
    NProgress.start();
    const t = setTimeout(() => NProgress.done(), 220); // quick visual cue
    return () => clearTimeout(t);
  }, [pathname]);

  return null;
}
