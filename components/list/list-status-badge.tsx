"use client";

import { cn } from "@/lib/utils";

type ListStatusBadgeProps = {
  status: string;
  label?: string;
  className?: string;
};

const STATUS_TONE_CLASS: Record<string, string> = {
  Draft: "border-slate-400/50 bg-slate-100 text-slate-700 dark:border-slate-500/30 dark:bg-slate-500/15 dark:text-slate-200",
  Confirmed:
    "border-indigo-400/50 bg-indigo-100 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/15 dark:text-indigo-200",
  InProduction:
    "border-blue-400/50 bg-blue-100 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-200",
  Completed:
    "border-emerald-400/50 bg-emerald-100 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-200",
  Cancelled: "border-zinc-400/50 bg-zinc-100 text-zinc-700 dark:border-zinc-500/30 dark:bg-zinc-500/15 dark:text-zinc-200",
  Planned: "border-cyan-400/50 bg-cyan-100 text-cyan-700 dark:border-cyan-500/30 dark:bg-cyan-500/15 dark:text-cyan-200",
  Released: "border-green-400/50 bg-green-100 text-green-700 dark:border-green-500/30 dark:bg-green-500/15 dark:text-green-200",
  Quarantined:
    "border-amber-400/50 bg-amber-100 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-200",
  Recalled: "border-rose-400/50 bg-rose-100 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-200",
  Destroyed: "border-red-400/50 bg-red-100 text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-200",
};

export function ListStatusBadge({ status, label, className }: ListStatusBadgeProps) {
  const toneClass = STATUS_TONE_CLASS[status] ?? "border-muted bg-muted text-muted-foreground";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        toneClass,
        className
      )}
    >
      {label ?? status}
    </span>
  );
}
