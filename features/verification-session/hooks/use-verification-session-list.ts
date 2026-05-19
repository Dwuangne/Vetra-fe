"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { listVerificationSessions } from "@/lib/api/services/verification-session.service";
import { ApiHttpError } from "@/lib/api/errors";
import type { VerificationSessionSummaryDto } from "@/lib/api/types/verification-session";
import { resolveApiErrorMessage } from "@/lib/i18n/resolve-api-error";
import { useLocale } from "@/lib/i18n";

const PAGE_SIZE = 20;

export function useVerificationSessionList() {
  const { locale } = useLocale();
  const [batchId, setBatchId] = useState("");
  const [productId, setProductId] = useState("");
  const [page, setPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchTick, setSearchTick] = useState(0);
  const [items, setItems] = useState<VerificationSessionSummaryDto[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const appliedBatchId = batchId.trim() || undefined;
  const appliedProductId = productId.trim() || undefined;
  const hasActiveFilters = Boolean(appliedBatchId || appliedProductId);

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const res = await listVerificationSessions({
        batchId: appliedBatchId,
        productId: appliedProductId,
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
  }, [appliedBatchId, appliedProductId, page, locale]);

  useEffect(() => {
    if (!hasSearched) return;
    void load();
  }, [hasSearched, searchTick, page, load]);

  const onSearch = useCallback(() => {
    setHasSearched(true);
    setPage(1);
    setSearchTick((t) => t + 1);
  }, []);

  const reload = useCallback(() => {
    if (!hasSearched) {
      onSearch();
      return;
    }
    setSearchTick((t) => t + 1);
  }, [hasSearched, onSearch]);

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
    batchId,
    setBatchId,
    productId,
    setProductId,
    hasActiveFilters,
  };
}
