import { apiGet, apiPost, apiRequest } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import type { ApiResponse } from "../types/api-response";
import type { PaginatedResult } from "../types/common";
import type {
  CreateLocationRequest,
  LocationDto,
  LocationListQuery,
  UpdateLocationRequest,
} from "../types/location";

function toSearchParams(query?: LocationListQuery): string {
  if (!query) return "";

  const params = new URLSearchParams();
  if (query.keyword) params.set("keyword", query.keyword);
  if (query.tenantId) params.set("tenantId", query.tenantId);
  if (query.partyId) params.set("partyId", query.partyId);
  if (query.page !== undefined) params.set("page", String(query.page));
  if (query.size !== undefined) params.set("size", String(query.size));
  const raw = params.toString();
  return raw ? `?${raw}` : "";
}

export function listLocations(
  query?: LocationListQuery
): Promise<ApiResponse<PaginatedResult<LocationDto>>> {
  return apiGet<PaginatedResult<LocationDto>>(`${API_ENDPOINTS.locations}${toSearchParams(query)}`);
}

export function getLocationById(locationId: string): Promise<ApiResponse<LocationDto>> {
  return apiGet<LocationDto>(`${API_ENDPOINTS.locations}/${locationId}`);
}

export function createLocation(body: CreateLocationRequest): Promise<ApiResponse<LocationDto>> {
  return apiPost<LocationDto>(API_ENDPOINTS.locations, body);
}

export function updateLocation(
  locationId: string,
  body: UpdateLocationRequest
): Promise<ApiResponse<LocationDto>> {
  return apiRequest<LocationDto>(`${API_ENDPOINTS.locations}/${locationId}`, {
    method: "PUT",
    body,
  });
}

export function deleteLocation(locationId: string): Promise<ApiResponse<null>> {
  return apiRequest<null>(`${API_ENDPOINTS.locations}/${locationId}`, {
    method: "DELETE",
  });
}
