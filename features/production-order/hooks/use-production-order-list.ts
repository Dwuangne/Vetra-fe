"use client";

import { listProductionOrders } from "@/lib/api/services/production-order.service";
import { useLocale } from "@/lib/i18n";
import { useKeywordPagedList } from "@/lib/table/use-keyword-paged-list";
import { useCallback } from "react";

export function useProductionOrderList() {
  const { locale } = useLocale();
  const fetchProductionOrders = useCallback(
    (args: { keyword?: string; page: number; size: number }) => listProductionOrders(args),
    []
  );

  return useKeywordPagedList(fetchProductionOrders, locale, { pageSize: 18 });
}
