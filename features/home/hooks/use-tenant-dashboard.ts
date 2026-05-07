"use client";

import { useCallback, useEffect, useState } from "react";

import type { TenantDashboardResultDto } from "@/lib/api/types/tenant-dashboard";
import { ApiHttpError } from "@/lib/api/errors";
import { getTenantDashboardSnapshot } from "@/lib/api/services/tenant-dashboard.service";

const DEFAULT_EVENT_DAYS = 30;

type UseTenantDashboardState = {
  data: TenantDashboardResultDto | null;
  loading: boolean;
  error: ApiHttpError | null;
  refetch: () => Promise<void>;
};

/** Loads tenant dashboard aggregates for the authenticated user (tenant from token). */
export function useTenantDashboard(eventDays: number = DEFAULT_EVENT_DAYS): UseTenantDashboardState {
  const [data, setData] = useState<TenantDashboardResultDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiHttpError | null>(null);

  const clampedDays = Math.min(Math.max(Number.isFinite(eventDays) ? Math.floor(eventDays) : DEFAULT_EVENT_DAYS, 1), 90);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTenantDashboardSnapshot(clampedDays);
      setData(res.data ?? null);
    } catch (e) {
      if (e instanceof ApiHttpError) {
        setError(e);
      } else {
        setError(
          new ApiHttpError(e instanceof Error ? e.message : "Request failed", 0, {})
        );
      }
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [clampedDays]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void refetch();
    }, 0);
    return () => window.clearTimeout(id);
  }, [refetch]);

  return { data, loading, error, refetch };
}
