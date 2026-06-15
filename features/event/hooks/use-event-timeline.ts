"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { queryEventTimeline } from "@/lib/api/services/event.service";
import { ApiHttpError } from "@/lib/api/errors";
import type { EventTimelineItemResult } from "@/lib/api/types/event";
import { resolveApiErrorMessage, translateErrorCode, useLocale } from "@/lib/i18n";
import { parseGuidQueryParam } from "@/lib/table/list-params";

const PAGE_SIZE = 20;
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_TIMELINE_MS = 31 * DAY_MS;

type AppliedEventTimelineFilters = {
  productionOrderId?: string;
  epcUri?: string;
  batchId?: string;
  locationId?: string;
  fromTime?: string;
  toTime?: string;
};

const EMPTY_APPLIED_FILTERS: AppliedEventTimelineFilters = {};

export type EventTimelineInitialParams = {
  epcUri?: string;
  batchId?: string;
  productionOrderId?: string;
  locationId?: string;
  fromTime?: string;
  toTime?: string;
};

function parseDateTimeQueryParam(raw: string | null | undefined): string | undefined {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) return undefined;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

export function parseEventTimelineSearchParams(
  params: URLSearchParams | { get: (key: string) => string | null }
): EventTimelineInitialParams {
  const epcUri = params.get("epcUri")?.trim() || undefined;
  const batchId = parseGuidQueryParam(params.get("batchId"));
  const productionOrderId = parseGuidQueryParam(params.get("productionOrderId"));
  const locationId = parseGuidQueryParam(params.get("locationId"));
  const fromTime = parseDateTimeQueryParam(params.get("fromTime"));
  const toTime = parseDateTimeQueryParam(params.get("toTime"));

  return {
    epcUri,
    batchId,
    productionOrderId,
    locationId,
    fromTime,
    toTime,
  };
}

function hasStrongTimelineFilter(params?: EventTimelineInitialParams): boolean {
  return Boolean(
    params?.productionOrderId ||
      params?.batchId ||
      params?.epcUri ||
      params?.locationId ||
      params?.fromTime ||
      params?.toTime
  );
}

function toAppliedFilters(params?: EventTimelineInitialParams): AppliedEventTimelineFilters {
  if (!params || !hasStrongTimelineFilter(params)) return EMPTY_APPLIED_FILTERS;
  return {
    productionOrderId: params.productionOrderId,
    epcUri: params.epcUri,
    batchId: params.batchId,
    locationId: params.locationId,
    fromTime: params.fromTime,
    toTime: params.toTime,
  };
}

export function useEventTimeline(initial?: EventTimelineInitialParams) {
  const { locale } = useLocale();
  const initialHasStrongFilter = hasStrongTimelineFilter(initial);
  const [productionOrderId, setProductionOrderId] = useState(initial?.productionOrderId ?? "");
  const [epcUri, setEpcUri] = useState(initial?.epcUri ?? "");
  const [batchId, setBatchId] = useState(initial?.batchId ?? "");
  const [locationId, setLocationId] = useState(initial?.locationId ?? "");
  const [fromTime, setFromTime] = useState(initial?.fromTime ?? "");
  const [toTime, setToTime] = useState(initial?.toTime ?? "");
  const [appliedFilters, setAppliedFilters] = useState<AppliedEventTimelineFilters>(() =>
    toAppliedFilters(initial)
  );
  const [page, setPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(initialHasStrongFilter);
  const [searchTick, setSearchTick] = useState(0);
  const [items, setItems] = useState<EventTimelineItemResult[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const hasActiveFilters = Boolean(
    appliedFilters.productionOrderId ||
      appliedFilters.epcUri ||
      appliedFilters.batchId ||
      appliedFilters.locationId ||
      appliedFilters.fromTime ||
      appliedFilters.toTime
  );

  const validateClient = useCallback((): string | null => {
    if (fromTime && toTime) {
      const fromMs = new Date(fromTime).getTime();
      const toMs = new Date(toTime).getTime();
      if (!Number.isNaN(fromMs) && !Number.isNaN(toMs) && fromMs > toMs) {
        return translateErrorCode("EVT_013", locale) ?? "Timeline time range is invalid.";
      }
      if (!Number.isNaN(fromMs) && !Number.isNaN(toMs) && toMs - fromMs > MAX_TIMELINE_MS) {
        return translateErrorCode("EVT_017", locale) ?? "Timeline query time window is too large.";
      }
    }

    return null;
  }, [fromTime, locale, toTime]);

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const res = await queryEventTimeline({
        productionOrderId: appliedFilters.productionOrderId,
        epcUri: appliedFilters.epcUri,
        batchId: appliedFilters.batchId,
        locationId: appliedFilters.locationId,
        fromTime: appliedFilters.fromTime,
        toTime: appliedFilters.toTime,
        page,
        size: PAGE_SIZE,
      });
      if (requestId !== requestIdRef.current) return;
      const data = res.data;
      setItems(data?.items ?? []);
      setTotalPages(data?.totalPages ?? 0);
    } catch (e) {
      if (requestId !== requestIdRef.current) return;
      const message =
        e instanceof ApiHttpError
          ? resolveApiErrorMessage(e, locale)
          : e instanceof Error
            ? e.message
            : "Request failed";
      setError(message);
      setItems([]);
      setTotalPages(0);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setInitialLoad(false);
      }
    }
  }, [appliedFilters, locale, page]);

  useEffect(() => {
    if (!hasSearched) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load() updates list state after search
    void load();
  }, [hasSearched, searchTick, page, load]);

  const onSearch = useCallback(() => {
    const validationMessage = validateClient();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }
    const nextFilters = {
      productionOrderId: productionOrderId.trim() || undefined,
      epcUri: epcUri.trim() || undefined,
      batchId: batchId.trim() || undefined,
      locationId: locationId.trim() || undefined,
      fromTime: fromTime || undefined,
      toTime: toTime || undefined,
    };
    const hasFilter = Boolean(
      nextFilters.productionOrderId ||
        nextFilters.epcUri ||
        nextFilters.batchId ||
        nextFilters.locationId ||
        nextFilters.fromTime ||
        nextFilters.toTime
    );
    if (!hasFilter) {
      setError(translateErrorCode("EVT_016", locale) ?? "At least one filter is required.");
      return;
    }
    setError(null);
    setAppliedFilters(nextFilters);
    setHasSearched(true);
    setPage(1);
    setSearchTick((t) => t + 1);
  }, [
    batchId,
    epcUri,
    fromTime,
    locationId,
    productionOrderId,
    toTime,
    validateClient,
    locale,
  ]);

  const reload = useCallback(() => {
    if (!hasSearched) {
      onSearch();
      return;
    }
    setSearchTick((t) => t + 1);
  }, [hasSearched, onSearch]);

  const clearFilters = useCallback(() => {
    setProductionOrderId("");
    setEpcUri("");
    setBatchId("");
    setLocationId("");
    setFromTime("");
    setToTime("");
    setAppliedFilters(EMPTY_APPLIED_FILTERS);
    setHasSearched(false);
    setError(null);
    setItems([]);
    setTotalPages(0);
    setPage(1);
  }, []);

  const handleProductionOrderIdChange = useCallback((value: string) => {
    setProductionOrderId(value);
    setBatchId((current) => (current && value.trim() !== productionOrderId.trim() ? "" : current));
  }, [productionOrderId]);

  return {
    items,
    page,
    setPage,
    totalPages,
    loading,
    initialLoad,
    error,
    hasSearched,
    onSearch,
    reload,
    productionOrderId,
    setProductionOrderId: handleProductionOrderIdChange,
    epcUri,
    setEpcUri,
    batchId,
    setBatchId,
    locationId,
    setLocationId,
    fromTime,
    setFromTime,
    toTime,
    setToTime,
    hasActiveFilters,
    clearFilters,
  };
}
