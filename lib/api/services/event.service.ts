import { apiGet, apiPost } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import type { ApiResponse } from "../types/api-response";
import type { PaginatedResult } from "../types/common";
import type {
  EventEpcListQuery,
  EventEpcResult,
  EventResult,
  EventTimelineItemResult,
  EventTimelineQuery,
  IngestEventRequest,
} from "../types/event";

function toTimelineSearchParams(query?: EventTimelineQuery): string {
  if (!query) return "";

  const params = new URLSearchParams();
  if (query.epcUri) params.set("epcUri", query.epcUri);
  if (query.batchId) params.set("batchId", query.batchId);
  if (query.productionOrderId) params.set("productionOrderId", query.productionOrderId);
  if (query.lotKeyword) params.set("lotKeyword", query.lotKeyword);
  if (query.locationId) params.set("locationId", query.locationId);
  if (query.fromTime) params.set("fromTime", query.fromTime);
  if (query.toTime) params.set("toTime", query.toTime);
  if (query.page !== undefined) params.set("page", String(query.page));
  if (query.size !== undefined) params.set("size", String(query.size));
  const raw = params.toString();
  return raw ? `?${raw}` : "";
}

export function ingestEvent(body: IngestEventRequest): Promise<ApiResponse<EventResult>> {
  return apiPost<EventResult>(`${API_ENDPOINTS.events}/ingest`, body);
}

export function getEventById(eventId: string): Promise<ApiResponse<EventResult>> {
  return apiGet<EventResult>(`${API_ENDPOINTS.events}/${eventId}`);
}

function toEpcListSearchParams(query?: EventEpcListQuery): string {
  if (!query) return "";

  const params = new URLSearchParams();
  if (query.page !== undefined) params.set("page", String(query.page));
  if (query.size !== undefined) params.set("size", String(query.size));
  const raw = params.toString();
  return raw ? `?${raw}` : "";
}

export function listEventEpcs(
  eventId: string,
  query?: EventEpcListQuery
): Promise<ApiResponse<PaginatedResult<EventEpcResult>>> {
  return apiGet<PaginatedResult<EventEpcResult>>(
    `${API_ENDPOINTS.events}/${eventId}/epcs${toEpcListSearchParams(query)}`
  );
}

export function queryEventTimeline(
  query?: EventTimelineQuery
): Promise<ApiResponse<PaginatedResult<EventTimelineItemResult>>> {
  return apiGet<PaginatedResult<EventTimelineItemResult>>(
    `${API_ENDPOINTS.events}/timeline${toTimelineSearchParams(query)}`
  );
}
