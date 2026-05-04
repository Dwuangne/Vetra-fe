"use client";

import { listProductionOrders } from "@/lib/api/services/production-order.service";
import type { Locale } from "@/lib/i18n/types";
import { useKeywordPagedList } from "@/lib/table/use-keyword-paged-list";
import { useCallback } from "react";

export function useProductionOrderList(locale: Locale) {
  const fetchProductionOrders = useCallback(
    (args: { keyword?: string; page: number; size: number }) => listProductionOrders(args),
    []
  );

  return useKeywordPagedList(fetchProductionOrders, locale, { pageSize: 18 });
}
