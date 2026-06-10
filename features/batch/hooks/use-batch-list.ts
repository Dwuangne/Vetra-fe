"use client";

import { useCallback, useState } from "react";

import { listBatches } from "@/lib/api/services/batch.service";
import { useLocale } from "@/lib/i18n";
import { useKeywordPagedList } from "@/lib/table/use-keyword-paged-list";

export function useBatchList(initialProductionOrderId?: string) {
  const { locale } = useLocale();
  const [productionOrderId, setProductionOrderId] = useState(initialProductionOrderId ?? "");

  const fetchBatches = useCallback(
    (args: { keyword?: string; page: number; size: number }) =>
      listBatches({
        ...args,
        productionOrderId: productionOrderId.trim() || undefined,
      }),
    [productionOrderId]
  );

  const list = useKeywordPagedList(fetchBatches, locale, { pageSize: 18 });

  return {
    ...list,
    productionOrderId,
    setProductionOrderId,
    hasProductionOrderFilter: productionOrderId.trim().length > 0,
  };
}
