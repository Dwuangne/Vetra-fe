import { apiGet, apiPost, apiRequest } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import type { ApiResponse } from "../types/api-response";
import type { PaginatedResult } from "../types/common";
import type {
  CertificateDto,
  CertificateListQuery,
  CreateCertificateRequest,
  UpdateCertificateRequest,
} from "../types/certificate";

function toSearchParams(query?: CertificateListQuery): string {
  if (!query) return "";

  const params = new URLSearchParams();
  if (query.keyword) params.set("keyword", query.keyword);
  if (query.tenantId) params.set("tenantId", query.tenantId);
  if (query.productId) params.set("productId", query.productId);
  if (query.locationId) params.set("locationId", query.locationId);
  if (query.page !== undefined) params.set("page", String(query.page));
  if (query.size !== undefined) params.set("size", String(query.size));
  const raw = params.toString();
  return raw ? `?${raw}` : "";
}

export function listCertificates(
  query?: CertificateListQuery
): Promise<ApiResponse<PaginatedResult<CertificateDto>>> {
  return apiGet<PaginatedResult<CertificateDto>>(`${API_ENDPOINTS.certificates}${toSearchParams(query)}`);
}

export function getCertificateById(certificateId: string): Promise<ApiResponse<CertificateDto>> {
  return apiGet<CertificateDto>(`${API_ENDPOINTS.certificates}/${certificateId}`);
}

export function createCertificate(body: CreateCertificateRequest): Promise<ApiResponse<CertificateDto>> {
  return apiPost<CertificateDto>(API_ENDPOINTS.certificates, body);
}

export function updateCertificate(
  certificateId: string,
  body: UpdateCertificateRequest
): Promise<ApiResponse<CertificateDto>> {
  return apiRequest<CertificateDto>(`${API_ENDPOINTS.certificates}/${certificateId}`, {
    method: "PUT",
    body,
  });
}

export function deleteCertificate(certificateId: string): Promise<ApiResponse<null>> {
  return apiRequest<null>(`${API_ENDPOINTS.certificates}/${certificateId}`, {
    method: "DELETE",
  });
}
