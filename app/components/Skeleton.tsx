// /app/components/Skeleton.tsx
import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  rounded = "rounded-md",
}: { className?: string; rounded?: string }) {
  return (
    <div
      className={cn("animate-pulse bg-base-200", rounded, className)}
      aria-hidden="true"
    />
  );
}

export function SkeletonLine({ className }: { className?: string }) {
  return <Skeleton className={cn("h-3 w-full", className)} />;
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm">
      <SkeletonLine className="mb-3 h-4 w-1/2" />
      <SkeletonLine className="mb-2 w-5/6" />
      <SkeletonLine className="mb-2 w-3/4" />
      <div className="mt-3 flex gap-2">
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <tr>
      <td className="px-4 py-3"><SkeletonLine className="h-4 w-40" /></td>
      <td className="px-4 py-3"><SkeletonLine className="h-4 w-36" /></td>
      <td className="px-4 py-3"><Skeleton className="h-6 w-24 rounded-full" /></td>
      <td className="px-4 py-3"><SkeletonLine className="h-4 w-28" /></td>
      <td className="px-4 py-3"><Skeleton className="h-8 w-24 rounded-full" /></td>
    </tr>
  );
}
