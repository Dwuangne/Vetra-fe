import { apiGet } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import type { ApiResponse } from "../types/api-response";
import type { TenantDashboardResultDto } from "../types/tenant-dashboard";

/** Query `days`: event series window in UTC calendar days (server clamps to 1–90). */
export function getTenantDashboardSnapshot(
  days: number = 30
): Promise<ApiResponse<TenantDashboardResultDto>> {
  const params = new URLSearchParams({ days: String(days) });
  return apiGet<TenantDashboardResultDto>(`${API_ENDPOINTS.tenantDashboard}?${params.toString()}`);
}
