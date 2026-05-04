"use client";

import { useCallback } from "react";

import { listProductInstances } from "@/lib/api/services/product-instance.service";
import type { Locale } from "@/lib/i18n/types";
import { useKeywordPagedList } from "@/lib/table/use-keyword-paged-list";

export function useProductInstanceList(locale: Locale, batchId: string) {
  const fetchPage = useCallback(
    (args: { keyword?: string; page: number; size: number }) =>
      listProductInstances({ ...args, batchId }),
    [batchId]
  );
  return useKeywordPagedList(fetchPage, locale, { pageSize: 20 });
}
