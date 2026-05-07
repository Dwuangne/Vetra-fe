import { apiGet, apiPost } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import type { ApiResponse } from "../types/api-response";
import type {
  CreateTenantUserRequestBody,
  ResetTenantUserPasswordRequestBody,
  TenantUserResultDto,
  TenantUserSummaryDto,
} from "../types/tenant-user";

export function listTenantUsers(): Promise<ApiResponse<TenantUserSummaryDto[]>> {
  return apiGet<TenantUserSummaryDto[]>(API_ENDPOINTS.tenantUsers);
}

export function createTenantUser(
  body: CreateTenantUserRequestBody
): Promise<ApiResponse<TenantUserResultDto>> {
  return apiPost<TenantUserResultDto>(API_ENDPOINTS.tenantUsers, body);
}

export function disableTenantUser(userId: string): Promise<ApiResponse<null>> {
  return apiPost<null>(`${API_ENDPOINTS.tenantUsers}/${userId}/disable`);
}

export function enableTenantUser(userId: string): Promise<ApiResponse<null>> {
  return apiPost<null>(`${API_ENDPOINTS.tenantUsers}/${userId}/enable`);
}

export function resetTenantUserPassword(
  userId: string,
  body: ResetTenantUserPasswordRequestBody
): Promise<ApiResponse<null>> {
  return apiPost<null>(`${API_ENDPOINTS.tenantUsers}/${userId}/reset-password`, body);
}
