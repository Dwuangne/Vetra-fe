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

export type EventTimelineInitialParams = {
  epcUri?: string;
  batchId?: string;
  productionOrderId?: string;
  lotKeyword?: string;
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
  const lotKeyword = params.get("lotKeyword")?.trim() || undefined;
  const locationId = parseGuidQueryParam(params.get("locationId"));
  const fromTime = parseDateTimeQueryParam(params.get("fromTime"));
  const toTime = parseDateTimeQueryParam(params.get("toTime"));

  return {
    epcUri,
    batchId,
    productionOrderId,
    lotKeyword,
    locationId,
    fromTime,
    toTime,
  };
}

export function useEventTimeline(initial?: EventTimelineInitialParams) {
  const { locale } = useLocale();
  const [lotKeyword, setLotKeyword] = useState(initial?.lotKeyword ?? "");
  const [productionOrderId, setProductionOrderId] = useState(initial?.productionOrderId ?? "");
  const [epcUri, setEpcUri] = useState(initial?.epcUri ?? "");
  const [batchId, setBatchId] = useState(initial?.batchId ?? "");
  const [locationId, setLocationId] = useState(initial?.locationId ?? "");
  const [fromTime, setFromTime] = useState(initial?.fromTime ?? "");
  const [toTime, setToTime] = useState(initial?.toTime ?? "");
  const [page, setPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchTick, setSearchTick] = useState(0);
  const [items, setItems] = useState<EventTimelineItemResult[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const appliedLotKeyword = lotKeyword.trim() || undefined;
  const appliedProductionOrderId = productionOrderId.trim() || undefined;
  const appliedEpcUri = epcUri.trim() || undefined;
  const appliedBatchId = batchId.trim() || undefined;
  const appliedLocationId = locationId.trim() || undefined;
  const appliedFromTime = fromTime || undefined;
  const appliedToTime = toTime || undefined;

  const hasActiveFilters = Boolean(
    appliedLotKeyword ||
      appliedProductionOrderId ||
      appliedEpcUri ||
      appliedBatchId ||
      appliedLocationId ||
      appliedFromTime ||
      appliedToTime
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
        lotKeyword: appliedLotKeyword,
        productionOrderId: appliedProductionOrderId,
        epcUri: appliedEpcUri,
        batchId: appliedBatchId,
        locationId: appliedLocationId,
        fromTime: appliedFromTime,
        toTime: appliedToTime,
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
  }, [
    appliedBatchId,
    appliedEpcUri,
    appliedFromTime,
    appliedLocationId,
    appliedLotKeyword,
    appliedProductionOrderId,
    appliedToTime,
    locale,
    page,
  ]);

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
    setError(null);
    setHasSearched(true);
    setPage(1);
    setSearchTick((t) => t + 1);
  }, [validateClient]);

  const reload = useCallback(() => {
    if (!hasSearched) {
      onSearch();
      return;
    }
    setSearchTick((t) => t + 1);
  }, [hasSearched, onSearch]);

  const clearFilters = useCallback(() => {
    setLotKeyword("");
    setProductionOrderId("");
    setEpcUri("");
    setBatchId("");
    setLocationId("");
    setFromTime("");
    setToTime("");
    setHasSearched(false);
    setError(null);
    setItems([]);
    setTotalPages(0);
    setPage(1);
  }, []);

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
    lotKeyword,
    setLotKeyword,
    productionOrderId,
    setProductionOrderId,
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
