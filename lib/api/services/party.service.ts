import { apiGet, apiPost, apiRequest } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import type { ApiResponse } from "../types/api-response";
import type { PaginatedResult } from "../types/common";
import type {
  CreatePartyRequest,
  PartyDto,
  PartyListQuery,
  UpdatePartyRequest,
} from "../types/party";

function toSearchParams(query?: PartyListQuery): string {
  if (!query) return "";

  const params = new URLSearchParams();
  if (query.keyword) params.set("keyword", query.keyword);
  if (query.tenantId) params.set("tenantId", query.tenantId);
  if (query.page !== undefined) params.set("page", String(query.page));
  if (query.size !== undefined) params.set("size", String(query.size));
  const raw = params.toString();
  return raw ? `?${raw}` : "";
}

export function listParties(
  query?: PartyListQuery
): Promise<ApiResponse<PaginatedResult<PartyDto>>> {
  return apiGet<PaginatedResult<PartyDto>>(`${API_ENDPOINTS.parties}${toSearchParams(query)}`);
}

export function getPartyById(partyId: string): Promise<ApiResponse<PartyDto>> {
  return apiGet<PartyDto>(`${API_ENDPOINTS.parties}/${partyId}`);
}

export function createParty(body: CreatePartyRequest): Promise<ApiResponse<PartyDto>> {
  return apiPost<PartyDto>(API_ENDPOINTS.parties, body);
}

export function updateParty(
  partyId: string,
  body: UpdatePartyRequest
): Promise<ApiResponse<PartyDto>> {
  return apiRequest<PartyDto>(`${API_ENDPOINTS.parties}/${partyId}`, {
    method: "PUT",
    body,
  });
}

export function deleteParty(partyId: string): Promise<ApiResponse<null>> {
  return apiRequest<null>(`${API_ENDPOINTS.parties}/${partyId}`, {
    method: "DELETE",
  });
}
