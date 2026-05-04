"use client";

import { useCallback } from "react";

import { listBatches } from "@/lib/api/services/batch.service";
import type { Locale } from "@/lib/i18n/types";
import { useKeywordPagedList } from "@/lib/table/use-keyword-paged-list";

export function useBatchList(locale: Locale) {
  const fetchBatches = useCallback((args: { keyword?: string; page: number; size: number }) => listBatches(args), []);
  return useKeywordPagedList(fetchBatches, locale, { pageSize: 18 });
}
