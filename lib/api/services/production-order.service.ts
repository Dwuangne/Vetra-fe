import { apiGet, apiPost } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import type { ApiResponse } from "../types/api-response";
import type { PaginatedResult } from "../types/common";
import type {
  CreateProductionOrderRequest,
  ProductionOrderDto,
  ProductionOrderListQuery,
  TransitionProductionOrderStatusRequest,
} from "../types/production-order";

function toSearchParams(query?: ProductionOrderListQuery): string {
  if (!query) return "";

  const params = new URLSearchParams();
  if (query.keyword) params.set("keyword", query.keyword);
  if (query.page !== undefined) params.set("page", String(query.page));
  if (query.size !== undefined) params.set("size", String(query.size));
  const raw = params.toString();
  return raw ? `?${raw}` : "";
}

export function listProductionOrders(
  query?: ProductionOrderListQuery
): Promise<ApiResponse<PaginatedResult<ProductionOrderDto>>> {
  return apiGet<PaginatedResult<ProductionOrderDto>>(
    `${API_ENDPOINTS.productionOrders}${toSearchParams(query)}`
  );
}

export function getProductionOrderById(
  productionOrderId: string
): Promise<ApiResponse<ProductionOrderDto>> {
  return apiGet<ProductionOrderDto>(`${API_ENDPOINTS.productionOrders}/${productionOrderId}`);
}

export function createProductionOrder(
  body: CreateProductionOrderRequest
): Promise<ApiResponse<ProductionOrderDto>> {
  return apiPost<ProductionOrderDto>(API_ENDPOINTS.productionOrders, body);
}

export function transitionProductionOrderStatus(
  productionOrderId: string,
  body: TransitionProductionOrderStatusRequest
): Promise<ApiResponse<ProductionOrderDto>> {
  return apiPost<ProductionOrderDto>(`${API_ENDPOINTS.productionOrders}/${productionOrderId}/status`, body);
}
