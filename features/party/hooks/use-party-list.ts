"use client";

import { listParties } from "@/lib/api/services/party.service";
import { useAuth } from "@/features/auth";
import { useKeywordPagedList } from "@/lib/table/use-keyword-paged-list";
import type { Locale } from "@/lib/i18n/types";
import { useCallback } from "react";

export function usePartyList(locale: Locale) {
  const { user } = useAuth();
  const tenantId = user?.tenantId?.trim() || undefined;
  const fetchParties = useCallback(
    (args: { keyword?: string; page: number; size: number }) => listParties({ ...args, tenantId }),
    [tenantId]
  );

  return useKeywordPagedList(fetchParties, locale);
}
