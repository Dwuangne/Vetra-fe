"use client";

import { listLocations } from "@/lib/api/services/location.service";
import { useAuth } from "@/features/auth";
import { useKeywordPagedList } from "@/lib/table/use-keyword-paged-list";
import type { Locale } from "@/lib/i18n/types";
import { useCallback } from "react";

export function useLocationList(locale: Locale) {
  const { user } = useAuth();
  const tenantId = user?.tenantId?.trim() || undefined;
  const fetchLocations = useCallback(
    (args: { keyword?: string; page: number; size: number }) => listLocations({ ...args, tenantId }),
    [tenantId]
  );

  return useKeywordPagedList(fetchLocations, locale);
}
