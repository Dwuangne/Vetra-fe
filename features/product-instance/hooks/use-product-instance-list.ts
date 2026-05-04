"use client";

import { useCallback } from "react";

import { listProductInstances } from "@/lib/api/services/product-instance.service";
import { useLocale } from "@/lib/i18n";
import { useKeywordPagedList } from "@/lib/table/use-keyword-paged-list";

export function useProductInstanceList(batchId: string) {
  const { locale } = useLocale();
  const fetchPage = useCallback(
    (args: { keyword?: string; page: number; size: number }) =>
      listProductInstances({ ...args, batchId }),
    [batchId]
  );
  return useKeywordPagedList(fetchPage, locale, { pageSize: 20 });
}
