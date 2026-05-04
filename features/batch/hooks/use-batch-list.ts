"use client";

import { useCallback } from "react";

import { listBatches } from "@/lib/api/services/batch.service";
import { useLocale } from "@/lib/i18n";
import { useKeywordPagedList } from "@/lib/table/use-keyword-paged-list";

export function useBatchList() {
  const { locale } = useLocale();
  const fetchBatches = useCallback((args: { keyword?: string; page: number; size: number }) => listBatches(args), []);
  return useKeywordPagedList(fetchBatches, locale, { pageSize: 18 });
}
