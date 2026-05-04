"use client";

import { listTenants } from "@/lib/api/services/tenant.service";
import { useKeywordPagedList } from "@/lib/table/use-keyword-paged-list";
import type { Locale } from "@/lib/i18n/types";

export function useTenantList(locale: Locale) {
  return useKeywordPagedList(listTenants, locale);
}
