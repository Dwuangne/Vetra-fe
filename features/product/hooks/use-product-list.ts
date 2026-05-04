"use client";

import { listProducts } from "@/lib/api/services/product.service";
import { useAuth } from "@/features/auth";
import { useKeywordPagedList } from "@/lib/table/use-keyword-paged-list";
import type { Locale } from "@/lib/i18n/types";
import { useCallback } from "react";

export function useProductList(locale: Locale) {
  const { user } = useAuth();
  const tenantId = user?.tenantId?.trim() || undefined;
  const fetchProducts = useCallback(
    (args: { keyword?: string; page: number; size: number }) => listProducts({ ...args, tenantId }),
    [tenantId]
  );

  return useKeywordPagedList(fetchProducts, locale, { pageSize: 18 });
}
