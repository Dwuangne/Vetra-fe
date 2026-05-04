import { apiGet, apiPost } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import type { ApiResponse } from "../types/api-response";
import type { PaginatedResult } from "../types/common";
import type {
  BatchDto,
  BatchListQuery,
  CreateBatchRequest,
  TransitionBatchStatusRequest,
} from "../types/batch";

function toSearchParams(query?: BatchListQuery): string {
  if (!query) return "";

  const params = new URLSearchParams();
  if (query.keyword) params.set("keyword", query.keyword);
  if (query.page !== undefined) params.set("page", String(query.page));
  if (query.size !== undefined) params.set("size", String(query.size));
  const raw = params.toString();
  return raw ? `?${raw}` : "";
}

export function listBatches(
  query?: BatchListQuery
): Promise<ApiResponse<PaginatedResult<BatchDto>>> {
  return apiGet<PaginatedResult<BatchDto>>(`${API_ENDPOINTS.batches}${toSearchParams(query)}`);
}

export function getBatchById(batchId: string): Promise<ApiResponse<BatchDto>> {
  return apiGet<BatchDto>(`${API_ENDPOINTS.batches}/${batchId}`);
}

export function createBatch(body: CreateBatchRequest): Promise<ApiResponse<BatchDto>> {
  return apiPost<BatchDto>(API_ENDPOINTS.batches, body);
}

export function transitionBatchStatus(
  batchId: string,
  body: TransitionBatchStatusRequest
): Promise<ApiResponse<BatchDto>> {
  return apiPost<BatchDto>(`${API_ENDPOINTS.batches}/${batchId}/status`, body);
}
