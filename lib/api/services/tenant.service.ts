import { apiGet, apiPost, apiRequest } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import type { ApiResponse } from "../types/api-response";
import type { PaginatedResult } from "../types/common";
import type {
  CreateTenantRequest,
  TenantDto,
  TenantListQuery,
  UpdateTenantRequest,
} from "../types/tenant";

function toSearchParams(query?: TenantListQuery): string {
  if (!query) return "";

  const params = new URLSearchParams();
  if (query.keyword) params.set("keyword", query.keyword);
  if (query.page !== undefined) params.set("page", String(query.page));
  if (query.size !== undefined) params.set("size", String(query.size));
  const raw = params.toString();
  return raw ? `?${raw}` : "";
}

export function listTenants(
  query?: TenantListQuery
): Promise<ApiResponse<PaginatedResult<TenantDto>>> {
  return apiGet<PaginatedResult<TenantDto>>(`${API_ENDPOINTS.tenants}${toSearchParams(query)}`);
}

export function getTenantById(tenantId: string): Promise<ApiResponse<TenantDto>> {
  return apiGet<TenantDto>(`${API_ENDPOINTS.tenants}/${tenantId}`);
}

export function createTenant(body: CreateTenantRequest): Promise<ApiResponse<TenantDto>> {
  return apiPost<TenantDto>(API_ENDPOINTS.tenants, body);
}

export function updateTenant(
  tenantId: string,
  body: UpdateTenantRequest
): Promise<ApiResponse<TenantDto>> {
  return apiRequest<TenantDto>(`${API_ENDPOINTS.tenants}/${tenantId}`, {
    method: "PUT",
    body,
  });
}

export function deleteTenant(tenantId: string): Promise<ApiResponse<null>> {
  return apiRequest<null>(`${API_ENDPOINTS.tenants}/${tenantId}`, {
    method: "DELETE",
  });
}
