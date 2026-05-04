import type { BatchStatus } from "@/lib/api/types/batch";

const BATCH_STATUS_BY_INDEX: BatchStatus[] = [
  "Planned",
  "InProduction",
  "Released",
  "Quarantined",
  "Recalled",
  "Destroyed",
];

/** Integer value sent to API (matches `BatchStatus` enum on BE; no string enum JSON). */
export function batchStatusToApiNumber(status: BatchStatus): number {
  const idx = BATCH_STATUS_BY_INDEX.indexOf(status);
  return idx >= 0 ? idx : 0;
}

export function normalizeBatchStatus(status: unknown): BatchStatus {
  if (typeof status === "number") {
    return BATCH_STATUS_BY_INDEX[status] ?? "Planned";
  }

  if (typeof status === "string") {
    const numeric = Number(status);
    if (!Number.isNaN(numeric) && Number.isInteger(numeric)) {
      return BATCH_STATUS_BY_INDEX[numeric] ?? "Planned";
    }

    if ((BATCH_STATUS_BY_INDEX as string[]).includes(status)) {
      return status as BatchStatus;
    }
  }

  return "Planned";
}
