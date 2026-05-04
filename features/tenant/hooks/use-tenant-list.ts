"use client";

import { listTenants } from "@/lib/api/services/tenant.service";
import { useLocale } from "@/lib/i18n";
import { useKeywordPagedList } from "@/lib/table/use-keyword-paged-list";

export function useTenantList() {
  const { locale } = useLocale();
  return useKeywordPagedList(listTenants, locale);
}
