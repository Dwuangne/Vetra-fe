import { apiGet, apiGetBlob, apiPost } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import type { ApiResponse } from "../types/api-response";
import type { PaginatedResult } from "../types/common";
import type {
  GenerateProductInstancesRequest,
  PreGenerateProductInstancesRequest,
  PreGenerateProductInstancesResult,
  ProductInstanceDto,
  ProductInstanceListQuery,
} from "../types/product-instance";

const generateProductInstancesBody = {} satisfies GenerateProductInstancesRequest;

/** Exactly one key — matches BE export-csv scope rules. */
export type ProductInstanceCsvExportQuery = { batchId: string } | { productId: string };

function toSearchParams(query?: ProductInstanceListQuery): string {
  if (!query) return "";

  const params = new URLSearchParams();
  if (query.batchId) params.set("batchId", query.batchId);
  if (query.productId) params.set("productId", query.productId);
  if (query.inPool === true) params.set("inPool", "true");
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

export function preGenerateProductInstances(
  body: PreGenerateProductInstancesRequest
): Promise<ApiResponse<PreGenerateProductInstancesResult>> {
  return apiPost<PreGenerateProductInstancesResult>(
    `${API_ENDPOINTS.productInstances}/pre-generate`,
    body
  );
}

export function downloadProductInstanceCsv(query: ProductInstanceCsvExportQuery) {
  const params = new URLSearchParams();
  if ("batchId" in query) {
    params.set("batchId", query.batchId);
  } else {
    params.set("productId", query.productId);
  }
  return apiGetBlob(`${API_ENDPOINTS.productInstances}/export-csv?${params.toString()}`);
}

/** Classic batch scope. */
export function downloadProductInstanceUrlsCsv(batchId: string) {
  return downloadProductInstanceCsv({ batchId });
}

/** Pool: all unexported instances for the product. */
export function downloadProductInstancePoolCsvByProduct(productId: string) {
  return downloadProductInstanceCsv({ productId });
}

