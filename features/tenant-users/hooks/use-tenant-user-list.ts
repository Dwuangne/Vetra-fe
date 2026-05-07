"use client";

import { ApiHttpError } from "@/lib/api/errors";
import { listTenantUsers } from "@/lib/api/services/tenant-user.service";
import type { TenantUserSummaryDto } from "@/lib/api/types/tenant-user";
import { useLocale } from "@/lib/i18n";
import { resolveApiErrorMessage } from "@/lib/i18n/resolve-api-error";
import { useCallback, useEffect, useState } from "react";

export function useTenantUserList() {
  const { locale } = useLocale();
  const [items, setItems] = useState<TenantUserSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listTenantUsers();
      setItems(res.data ?? []);
    } catch (e: unknown) {
      const msg =
        e instanceof ApiHttpError ? resolveApiErrorMessage(e, locale) : e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { items, loading, error, reload };
}
