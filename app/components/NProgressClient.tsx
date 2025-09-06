// /app/components/NProgressClient.tsx
"use client";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

NProgress.configure({ showSpinner: false, trickleSpeed: 120 });

export default function NProgressClient() {
  const router = useRouter();

  useEffect(() => {
    let timeout: any;

    const start = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => NProgress.start(), 120);
    };
    const done = () => {
      clearTimeout(timeout);
      NProgress.done();
    };

    // Patch fetch to show on API calls (optional)
    const _fetch = window.fetch;
    // @ts-ignore
    window.fetch = async (...args) => {
      start();
      try {
        const res = await _fetch(...args);
        return res;
      } finally {
        done();
      }
    };

    // Router events (App Router has no direct events; this is a light heuristic)
    start();
    done();

    return () => {
      // cleanup fetch patch
      // @ts-ignore
      window.fetch = _fetch;
      clearTimeout(timeout);
      NProgress.remove();
    };
  }, [router]);

  return null;
}
