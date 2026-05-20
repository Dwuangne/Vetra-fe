import type { PagedListQuery } from "./common";

export type BatchStatus =
  | "Planned"
  | "InProduction"
  | "Released"
  | "Quarantined"
  | "Recalled"
  | "Destroyed";

export type BatchDto = {
  batchId: string;
  tenantId: string;
  productId: string;
  lotNumber: string;
  expiryDate: string | null;
  bestBeforeDate: string | null;
  productionDate: string | null;
  packDate: string | null;
  status: BatchStatus;
  plannedQuantity: number;
  releasedQuantity: number | null;
  productionOrderId: string;
};

export type BatchListQuery = PagedListQuery;

export type CreateBatchRequest = {
  productId: string;
  lotNumber: string;
  plannedQuantity: number;
  productionOrderId: string;
  productionDate?: string | null;
  packDate?: string | null;
  bestBeforeDate?: string | null;
  expiryDate?: string | null;
};

/** Wire body: BE binds enum as integer (default System.Text.Json, no string converter). */
export type TransitionBatchStatusRequest = {
  nextStatus: number;
  releasedQuantity?: number | null;
};
