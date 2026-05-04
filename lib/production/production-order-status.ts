import type { ProductionOrderStatus } from "@/lib/api/types/production-order";

const PRODUCTION_ORDER_STATUS_BY_INDEX: ProductionOrderStatus[] = [
  "Draft",
  "Confirmed",
  "InProduction",
  "Completed",
  "Cancelled",
];

/** Integer value sent to API (matches `ProductionOrderStatus` enum on BE; no string enum JSON). */
export function productionOrderStatusToApiNumber(status: ProductionOrderStatus): number {
  const idx = PRODUCTION_ORDER_STATUS_BY_INDEX.indexOf(status);
  return idx >= 0 ? idx : 0;
}

export function normalizeProductionOrderStatus(status: unknown): ProductionOrderStatus {
  if (typeof status === "number") {
    return PRODUCTION_ORDER_STATUS_BY_INDEX[status] ?? "Draft";
  }

  if (typeof status === "string") {
    const numeric = Number(status);
    if (!Number.isNaN(numeric) && Number.isInteger(numeric)) {
      return PRODUCTION_ORDER_STATUS_BY_INDEX[numeric] ?? "Draft";
    }

    if ((PRODUCTION_ORDER_STATUS_BY_INDEX as string[]).includes(status)) {
      return status as ProductionOrderStatus;
    }
  }

  return "Draft";
}
