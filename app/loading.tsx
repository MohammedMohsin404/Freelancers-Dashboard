// /app/loading.tsx
"use client";

import { PageLoader } from "@/app/components/Loader";

export default function AppLoading() {
  return <PageLoader label="Preparing your dashboard…" tip="Fetching latest data & preferences" />;
}
