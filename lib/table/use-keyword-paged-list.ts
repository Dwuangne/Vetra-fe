"use client";

import { ApiHttpError } from "@/lib/api/errors";
import type { ApiResponse } from "@/lib/api/types/api-response";
import type { PaginatedResult } from "@/lib/api/types/common";
import { translateCommon } from "@/lib/i18n/translate";
import { resolveApiErrorMessage } from "@/lib/i18n/resolve-api-error";
import type { Locale } from "@/lib/i18n/types";
import { useCallback, useEffect, useRef, useState } from "react";

export type PagedListFetcher<T> = (args: {
  keyword?: string;
  page: number;
  size: number;
}) => Promise<ApiResponse<PaginatedResult<T>>>;

export type PagedListSlice<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  loading: boolean;
  initialLoad: boolean;
  error: string | null;
};

/**
 * Debounced keyword filter + paging for paged GET list APIs (JWT-scoped callers).
 */
export function useKeywordPagedList<T>(
  fetchPage: PagedListFetcher<T>,
  locale: Locale,
  options?: { pageSize?: number }
) {
  const pageSizeFixed = options?.pageSize ?? 20;

  const [keyword, setKeyword] = useState("");
  const [appliedKeyword, setAppliedKeyword] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [searchTick, setSearchTick] = useState(0);
  const [page, setPage] = useState(1);
  const queryKey = `${appliedKeyword.trim()}|${page}|${pageSizeFixed}`;
  const inflightQueryKeyRef = useRef<string | null>(null);
  const lastSuccessQueryKeyRef = useRef<string | null>(null);
  const requestIdRef = useRef(0);

  const [state, setState] = useState<PagedListSlice<T>>({
    items: [],
    page: 1,
    pageSize: pageSizeFixed,
    total: 0,
    totalPages: 0,
    loading: false,
    initialLoad: true,
    error: null,
  });

  const load = useCallback(async (mode: "auto" | "force" = "auto") => {
    if (
      mode === "auto" &&
      (inflightQueryKeyRef.current === queryKey || lastSuccessQueryKeyRef.current === queryKey)
    ) {
      return;
    }

    inflightQueryKeyRef.current = queryKey;
    const requestId = ++requestIdRef.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetchPage({
        keyword: appliedKeyword.trim() || undefined,
        page,
        size: pageSizeFixed,
      });

      if (requestId !== requestIdRef.current) return;

      const data = res.data;
      if (!data) {
        setState((s) => ({
          ...s,
          items: [],
          loading: false,
          initialLoad: false,
          error: null,
        }));
        lastSuccessQueryKeyRef.current = queryKey;
        return;
      }
      setState({
        items: data.items ?? [],
        page: data.page,
        pageSize: data.size,
        total: data.total,
        totalPages: data.totalPages,
        loading: false,
        initialLoad: false,
        error: null,
      });
      lastSuccessQueryKeyRef.current = queryKey;
    } catch (e: unknown) {
      if (requestId !== requestIdRef.current) return;
      const msg =
        e instanceof ApiHttpError
          ? resolveApiErrorMessage(e, locale)
          : e instanceof Error
            ? e.message
            : translateCommon("errorGeneric", locale);
      setState((s) => ({
        ...s,
        loading: false,
        initialLoad: false,
        error: msg,
      }));
    } finally {
      if (inflightQueryKeyRef.current === queryKey) {
        inflightQueryKeyRef.current = null;
      }
    }
  }, [fetchPage, appliedKeyword, page, pageSizeFixed, locale, queryKey]);

  useEffect(() => {
    if (!hasSearched) return;
    void load();
  }, [hasSearched, load, queryKey, searchTick]);

  const onSearch = useCallback(() => {
    const normalized = keyword.trim();
    lastSuccessQueryKeyRef.current = null;
    inflightQueryKeyRef.current = null;
    setAppliedKeyword(normalized);
    setPage(1);
    setHasSearched(true);
    setSearchTick((v) => v + 1);
  }, [keyword]);

  const reload = useCallback(() => {
    if (!hasSearched) return;
    lastSuccessQueryKeyRef.current = null;
    void load("force");
  }, [hasSearched, load]);

  const hasActiveFilters = appliedKeyword.length > 0;

  return {
    hasSearched,
    onSearch,
    keyword,
    setKeyword,
    setPage,
    reload,
    hasActiveFilters,
    ...state,
    pageSize: pageSizeFixed,
  };
}
