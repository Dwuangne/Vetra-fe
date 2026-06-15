import { apiGet, apiPost, apiRequest } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import type { ApiResponse } from "../types/api-response";
import type { PaginatedResult } from "../types/common";
import type {
  AttributeDefinitionDto,
  AttributeDefinitionListQuery,
  CreateAttributeDefinitionRequest,
  UpdateAttributeDefinitionRequest,
} from "../types/attribute-definition";

function toSearchParams(query?: AttributeDefinitionListQuery): string {
  if (!query) return "";

  const params = new URLSearchParams();
  if (query.keyword) params.set("keyword", query.keyword);
  if (query.dataType) params.set("dataType", query.dataType);
  if (query.page !== undefined) params.set("page", String(query.page));
  if (query.size !== undefined) params.set("size", String(query.size));
  const raw = params.toString();
  return raw ? `?${raw}` : "";
}

export function listAttributeDefinitions(
  query?: AttributeDefinitionListQuery
): Promise<ApiResponse<PaginatedResult<AttributeDefinitionDto>>> {
  return apiGet<PaginatedResult<AttributeDefinitionDto>>(
    `${API_ENDPOINTS.attributeDefinitions}${toSearchParams(query)}`
  );
}

export function getAttributeDefinitionById(attrId: string): Promise<ApiResponse<AttributeDefinitionDto>> {
  return apiGet<AttributeDefinitionDto>(`${API_ENDPOINTS.attributeDefinitions}/${attrId}`);
}

export function createAttributeDefinition(
  body: CreateAttributeDefinitionRequest
): Promise<ApiResponse<AttributeDefinitionDto>> {
  return apiPost<AttributeDefinitionDto>(API_ENDPOINTS.attributeDefinitions, body);
}

export function updateAttributeDefinition(
  attrId: string,
  body: UpdateAttributeDefinitionRequest
): Promise<ApiResponse<AttributeDefinitionDto>> {
  return apiRequest<AttributeDefinitionDto>(`${API_ENDPOINTS.attributeDefinitions}/${attrId}`, {
    method: "PUT",
    body,
  });
}

export function deleteAttributeDefinition(attrId: string): Promise<ApiResponse<null>> {
  return apiRequest<null>(`${API_ENDPOINTS.attributeDefinitions}/${attrId}`, {
    method: "DELETE",
  });
}
