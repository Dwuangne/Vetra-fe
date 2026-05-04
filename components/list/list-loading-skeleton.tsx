"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type ListLoadingSkeletonProps = {
  /** Table body rows to simulate */
  rows?: number;
  columns?: number;
  /** Toolbar-style skeleton above the grid */
  showToolbar?: boolean;
  className?: string;
};

/**
 * Initial / refetch loading state for list pages: filters + table-like skeleton.
 */
export function ListLoadingSkeleton({
  rows = 6,
  columns = 4,
  showToolbar = true,
  className,
}: ListLoadingSkeletonProps) {
  return (
    <div
      className={cn("flex flex-col gap-4", className)}
      aria-busy="true"
      aria-live="polite"
    >
      {showToolbar && (
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
      )}
      <div className="overflow-hidden rounded-md border">
        <div
          className="grid gap-3 border-b p-3"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={r}
            className="grid gap-3 border-b p-3 last:border-b-0"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton key={c} className="h-6 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
