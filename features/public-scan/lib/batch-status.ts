import type { BatchStatus } from "@/lib/api/types/batch";

const BY_INDEX: readonly BatchStatus[] = [
  "Planned",
  "InProduction",
  "Released",
  "Quarantined",
  "Recalled",
  "Destroyed",
] as const;

export function parsePublicScanBatchStatus(value: unknown): BatchStatus | undefined {
  if (typeof value === "string") {
    if (BY_INDEX.includes(value as BatchStatus)) return value as BatchStatus;
    return undefined;
  }
  if (typeof value === "number" && value >= 0 && value < BY_INDEX.length) {
    return BY_INDEX[value]!;
  }
  return undefined;
}
