import { apiGet, apiRequest } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import type { ApiResponse } from "../types/api-response";
import type { FormFieldDto, FormTemplateDto, UpsertFormFieldRequest } from "../types/form-template";

function fieldsPath(templateId: string): string {
  return `${API_ENDPOINTS.formTemplates}/${templateId}/fields`;
}

export function listFormFields(templateId: string): Promise<ApiResponse<FormFieldDto[]>> {
  return apiGet<FormFieldDto[]>(fieldsPath(templateId));
}

export function upsertFormField(
  templateId: string,
  body: UpsertFormFieldRequest
): Promise<ApiResponse<FormTemplateDto>> {
  return apiRequest<FormTemplateDto>(fieldsPath(templateId), {
    method: "PUT",
    body,
  });
}

export function removeFormField(templateId: string, attrId: string): Promise<ApiResponse<FormTemplateDto>> {
  return apiRequest<FormTemplateDto>(`${fieldsPath(templateId)}/${attrId}`, {
    method: "DELETE",
  });
}
