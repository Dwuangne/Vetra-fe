import { apiGet, apiPost, apiRequest } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import type { ApiResponse } from "../types/api-response";
import type { PaginatedResult } from "../types/common";
import type {
  CreateFormTemplateRequest,
  FormTemplateDto,
  FormTemplateListQuery,
  UpdateFormTemplateRequest,
} from "../types/form-template";

function toSearchParams(query?: FormTemplateListQuery): string {
  if (!query) return "";

  const params = new URLSearchParams();
  if (query.keyword) params.set("keyword", query.keyword);
  if (query.bizStep) params.set("bizStep", query.bizStep);
  if (query.page !== undefined) params.set("page", String(query.page));
  if (query.size !== undefined) params.set("size", String(query.size));
  const raw = params.toString();
  return raw ? `?${raw}` : "";
}

export function listFormTemplates(
  query?: FormTemplateListQuery
): Promise<ApiResponse<PaginatedResult<FormTemplateDto>>> {
  return apiGet<PaginatedResult<FormTemplateDto>>(`${API_ENDPOINTS.formTemplates}${toSearchParams(query)}`);
}

export function getFormTemplateById(templateId: string): Promise<ApiResponse<FormTemplateDto>> {
  return apiGet<FormTemplateDto>(`${API_ENDPOINTS.formTemplates}/${templateId}`);
}

export function createFormTemplate(body: CreateFormTemplateRequest): Promise<ApiResponse<FormTemplateDto>> {
  return apiPost<FormTemplateDto>(API_ENDPOINTS.formTemplates, body);
}

export function updateFormTemplate(
  templateId: string,
  body: UpdateFormTemplateRequest
): Promise<ApiResponse<FormTemplateDto>> {
  return apiRequest<FormTemplateDto>(`${API_ENDPOINTS.formTemplates}/${templateId}`, {
    method: "PUT",
    body,
  });
}

export function deleteFormTemplate(templateId: string): Promise<ApiResponse<null>> {
  return apiRequest<null>(`${API_ENDPOINTS.formTemplates}/${templateId}`, {
    method: "DELETE",
  });
}
