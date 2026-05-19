import { apiGet, apiPost } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import type { ApiResponse } from "../types/api-response";
import type { PaginatedResult } from "../types/common";
import type {
  OpenVerificationSessionRequest,
  OpenVerificationSessionResult,
  VerificationAttachLineDto,
  VerificationAttachLineListQuery,
  VerificationSessionDetailDto,
  VerificationSessionListQuery,
  VerificationSessionSummaryDto,
} from "../types/verification-session";

function toSearchParams(query?: VerificationSessionListQuery): string {
  if (!query) return "";

  const params = new URLSearchParams();
  if (query.batchId) params.set("batchId", query.batchId);
  if (query.productId) params.set("productId", query.productId);
  if (query.page !== undefined) params.set("page", String(query.page));
  if (query.size !== undefined) params.set("size", String(query.size));
  const raw = params.toString();
  return raw ? `?${raw}` : "";
}

export function listVerificationSessions(
  query?: VerificationSessionListQuery
): Promise<ApiResponse<PaginatedResult<VerificationSessionSummaryDto>>> {
  return apiGet<PaginatedResult<VerificationSessionSummaryDto>>(
    `${API_ENDPOINTS.verificationSessions}${toSearchParams(query)}`
  );
}

export function getVerificationSessionById(
  sessionId: string
): Promise<ApiResponse<VerificationSessionDetailDto>> {
  return apiGet<VerificationSessionDetailDto>(`${API_ENDPOINTS.verificationSessions}/${sessionId}`);
}

function toAttachLineSearchParams(query?: VerificationAttachLineListQuery): string {
  if (!query) return "";

  const params = new URLSearchParams();
  if (query.outcome !== undefined) params.set("outcome", String(query.outcome));
  if (query.clientStatus) params.set("clientStatus", query.clientStatus);
  if (query.keyword) params.set("keyword", query.keyword);
  if (query.page !== undefined) params.set("page", String(query.page));
  if (query.size !== undefined) params.set("size", String(query.size));
  const raw = params.toString();
  return raw ? `?${raw}` : "";
}

export function listVerificationSessionAttachLines(
  sessionId: string,
  query?: VerificationAttachLineListQuery
): Promise<ApiResponse<PaginatedResult<VerificationAttachLineDto>>> {
  return apiGet<PaginatedResult<VerificationAttachLineDto>>(
    `${API_ENDPOINTS.verificationSessions}/${sessionId}/attach-lines${toAttachLineSearchParams(query)}`
  );
}

export function openVerificationSession(
  body: OpenVerificationSessionRequest
): Promise<ApiResponse<OpenVerificationSessionResult>> {
  return apiPost<OpenVerificationSessionResult>(API_ENDPOINTS.verificationSessions, body);
}

export function cancelVerificationSession(
  sessionId: string
): Promise<ApiResponse<VerificationSessionSummaryDto>> {
  return apiPost<VerificationSessionSummaryDto>(
    `${API_ENDPOINTS.verificationSessions}/${sessionId}/cancel`
  );
}
