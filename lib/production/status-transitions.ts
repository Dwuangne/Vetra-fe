import type { BatchStatus } from "@/lib/api/types/batch";
import type { ProductionOrderStatus } from "@/lib/api/types/production-order";

export const productionOrderNextStatusMap: Record<ProductionOrderStatus, ProductionOrderStatus[]> = {
  Draft: ["Confirmed", "Cancelled"],
  Confirmed: ["InProduction", "Cancelled"],
  InProduction: ["Completed", "Cancelled"],
  Completed: [],
  Cancelled: [],
};

export const batchNextStatusMap: Record<BatchStatus, BatchStatus[]> = {
  Planned: ["InProduction", "Quarantined", "Destroyed"],
  InProduction: ["Released", "Quarantined", "Destroyed"],
  Released: ["Recalled", "Destroyed"],
  Quarantined: ["Released", "Destroyed"],
  Recalled: ["Destroyed"],
  Destroyed: [],
};

export function getNextProductionOrderStatuses(currentStatus: ProductionOrderStatus): ProductionOrderStatus[] {
  return productionOrderNextStatusMap[currentStatus];
}

export function getNextBatchStatuses(currentStatus: BatchStatus): BatchStatus[] {
  return batchNextStatusMap[currentStatus];
}
