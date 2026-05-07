import type { BatchStatus } from "./batch";
import type { ProductionOrderStatus } from "./production-order";

export type TenantDashboardKpisDto = {
  parties: number;
  locations: number;
  products: number;
  certificates: number;
  productInstances: number;
  activeProductionOrders: number;
  batches: number;
};

export type BatchStatusCountItemDto = {
  /** Default STJ may serialize enums as integers. */
  status: BatchStatus | number;
  count: number;
};

export type ProductionOrderStatusCountItemDto = {
  status: ProductionOrderStatus | number;
  count: number;
};

export type EventCountByUtcDayItemDto = {
  dayUtc: string;
  count: number;
};

export type TenantDashboardResultDto = {
  kpis: TenantDashboardKpisDto;
  batchesByStatus: BatchStatusCountItemDto[];
  productionOrdersByStatus: ProductionOrderStatusCountItemDto[];
  eventsByUtcDay: EventCountByUtcDayItemDto[];
};

const BATCH_STATUS_ORDER: readonly BatchStatus[] = [
  "Planned",
  "InProduction",
  "Released",
  "Quarantined",
  "Recalled",
  "Destroyed",
] as const;

const PO_STATUS_ORDER: readonly ProductionOrderStatus[] = [
  "Draft",
  "Confirmed",
  "InProduction",
  "Completed",
  "Cancelled",
] as const;

export function normalizeBatchStatus(status: BatchStatus | number): BatchStatus {
  if (typeof status === "string") return status;
  const fromIndex = BATCH_STATUS_ORDER[status];
  return fromIndex ?? "Planned";
}

export function normalizeProductionOrderStatus(
  status: ProductionOrderStatus | number
): ProductionOrderStatus {
  if (typeof status === "string") return status;
  const fromIndex = PO_STATUS_ORDER[status];
  return fromIndex ?? "Draft";
}
