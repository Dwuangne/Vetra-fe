import type { PagedListQuery } from "./common";

export type ProductionOrderStatus =
  | "Draft"
  | "Confirmed"
  | "InProduction"
  | "Completed"
  | "Cancelled";

export type ProductionOrderDto = {
  productionOrderId: string;
  tenantId: string;
  orderNumber: string;
  description: string | null;
  productId: string;
  plannedQuantity: number;
  actualQuantity: number | null;
  plannedStartTime: string;
  plannedEndTime: string;
  actualStartTime: string | null;
  actualEndTime: string | null;
  productionLocationId: string | null;
  status: ProductionOrderStatus | number;
};

export type ProductionOrderListQuery = PagedListQuery;

export type CreateProductionOrderRequest = {
  orderNumber: string;
  description?: string | null;
  productId: string;
  plannedQuantity: number;
  plannedStartTime: string;
  plannedEndTime: string;
  productionLocationId?: string | null;
};

/** Wire body: BE binds enum as integer (default System.Text.Json, no string converter). */
export type TransitionProductionOrderStatusRequest = {
  nextStatus: number;
  actualQuantity?: number | null;
};
