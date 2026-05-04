import { apiGet, apiPost, apiRequest } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import type { ApiResponse } from "../types/api-response";
import type { PaginatedResult } from "../types/common";
import type {
  CreateProductRequest,
  ProductDto,
  ProductListQuery,
  UpdateProductRequest,
} from "../types/product";

function toSearchParams(query?: ProductListQuery): string {
  if (!query) return "";

  const params = new URLSearchParams();
  if (query.keyword) params.set("keyword", query.keyword);
  if (query.tenantId) params.set("tenantId", query.tenantId);
  if (query.page !== undefined) params.set("page", String(query.page));
  if (query.size !== undefined) params.set("size", String(query.size));
  const raw = params.toString();
  return raw ? `?${raw}` : "";
}

export function listProducts(
  query?: ProductListQuery
): Promise<ApiResponse<PaginatedResult<ProductDto>>> {
  return apiGet<PaginatedResult<ProductDto>>(`${API_ENDPOINTS.products}${toSearchParams(query)}`);
}

export function getProductById(productId: string): Promise<ApiResponse<ProductDto>> {
  return apiGet<ProductDto>(`${API_ENDPOINTS.products}/${productId}`);
}

export function createProduct(body: CreateProductRequest): Promise<ApiResponse<ProductDto>> {
  return apiPost<ProductDto>(API_ENDPOINTS.products, body);
}

export function updateProduct(
  productId: string,
  body: UpdateProductRequest
): Promise<ApiResponse<ProductDto>> {
  return apiRequest<ProductDto>(`${API_ENDPOINTS.products}/${productId}`, {
    method: "PUT",
    body,
  });
}

export function deleteProduct(productId: string): Promise<ApiResponse<null>> {
  return apiRequest<null>(`${API_ENDPOINTS.products}/${productId}`, {
    method: "DELETE",
  });
}
