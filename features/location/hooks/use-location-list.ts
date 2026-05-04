"use client";

import { listLocations } from "@/lib/api/services/location.service";
import { useAuth } from "@/features/auth";
import { useLocale } from "@/lib/i18n";
import { useKeywordPagedList } from "@/lib/table/use-keyword-paged-list";
import { useCallback } from "react";

export function useLocationList() {
  const { locale } = useLocale();
  const { user } = useAuth();
  const tenantId = user?.tenantId?.trim() || undefined;
  const fetchLocations = useCallback(
    (args: { keyword?: string; page: number; size: number }) => listLocations({ ...args, tenantId }),
    [tenantId]
  );

  return useKeywordPagedList(fetchLocations, locale);
}
