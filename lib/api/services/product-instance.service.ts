import { apiGet, apiGetBlob, apiPost } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import type { ApiResponse } from "../types/api-response";
import type { PaginatedResult } from "../types/common";
import type {
  GenerateProductInstancesRequest,
  ProductInstanceDto,
  ProductInstanceListQuery,
} from "../types/product-instance";

const generateProductInstancesBody = {} satisfies GenerateProductInstancesRequest;

function toSearchParams(query?: ProductInstanceListQuery): string {
  if (!query) return "";

  const params = new URLSearchParams();
  if (query.batchId) params.set("batchId", query.batchId);
  if (query.keyword) params.set("keyword", query.keyword);
  if (query.page !== undefined) params.set("page", String(query.page));
  if (query.size !== undefined) params.set("size", String(query.size));
  const raw = params.toString();
  return raw ? `?${raw}` : "";
}

export function listProductInstances(
  query?: ProductInstanceListQuery
): Promise<ApiResponse<PaginatedResult<ProductInstanceDto>>> {
  return apiGet<PaginatedResult<ProductInstanceDto>>(
    `${API_ENDPOINTS.productInstances}${toSearchParams(query)}`
  );
}

export function generateProductInstances(batchId: string): Promise<ApiResponse<ProductInstanceDto[]>> {
  return apiPost<ProductInstanceDto[]>(
    `${API_ENDPOINTS.productInstances}/generate/${batchId}`,
    generateProductInstancesBody
  );
}

export function downloadProductInstanceUrlsCsv(batchId: string) {
  const q = new URLSearchParams({ batchId });
  return apiGetBlob(`${API_ENDPOINTS.productInstances}/export-csv?${q.toString()}`);
}
