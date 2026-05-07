"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import type { BatchStatus } from "@/lib/api/types/batch";
import type { ProductionOrderStatus } from "@/lib/api/types/production-order";
import {
  normalizeBatchStatus,
  normalizeProductionOrderStatus,
  type TenantDashboardResultDto,
} from "@/lib/api/types/tenant-dashboard";
import { ListErrorBanner } from "@/components/list/list-error-banner";
import { Skeleton } from "@/components/ui/skeleton";
import { useTenantDashboard } from "@/features/home/hooks/use-tenant-dashboard";
import { messages, pickLocalized, resolveApiErrorMessage, useLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AppShellLayout } from "./app-shell-layout";

const CHART_FILLS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const EVENT_DAY_OPTIONS = [7, 30, 90] as const;

function chartFill(i: number): string {
  return CHART_FILLS[i % CHART_FILLS.length] ?? CHART_FILLS[0];
}

function batchLabel(key: BatchStatus, locale: Locale): string {
  const row = messages.tenantDashboard.batchStatus[key];
  return row ? pickLocalized(row, locale) : key;
}

function orderLabel(key: ProductionOrderStatus, locale: Locale): string {
  const row = messages.tenantDashboard.productionOrderStatus[key];
  return row ? pickLocalized(row, locale) : key;
}

function interpolateDays(template: string, days: number): string {
  return template.replace(/\{days\}/g, String(days));
}

function KpiCard({
  title,
  value,
  className,
  toneClass,
}: {
  title: string;
  value: number;
  className?: string;
  toneClass?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-colors",
        toneClass,
        className
      )}
    >
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-live="polite">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-[320px] rounded-lg" />
        <Skeleton className="h-[320px] rounded-lg" />
      </div>
      <Skeleton className="h-[340px] rounded-lg" />
    </div>
  );
}

function buildBatchPieRows(data: TenantDashboardResultDto, locale: Locale) {
  return data.batchesByStatus.map((item, i) => {
    const key = normalizeBatchStatus(item.status);
    return {
      key,
      label: batchLabel(key, locale),
      count: item.count,
      fill: chartFill(i),
    };
  });
}

function buildOrderBarRows(data: TenantDashboardResultDto, locale: Locale) {
  return data.productionOrdersByStatus.map((item) => {
    const key = normalizeProductionOrderStatus(item.status);
    return {
      key,
      label: orderLabel(key, locale),
      count: item.count,
    };
  });
}

function buildEventLineRows(data: TenantDashboardResultDto) {
  return [...data.eventsByUtcDay]
    .map((row) => {
      let dayLabel = row.dayUtc;
      try {
        dayLabel = format(parseISO(row.dayUtc), "MMM d");
      } catch {
        /* keep raw */
      }
      return { dayUtc: row.dayUtc, dayLabel, count: row.count };
    })
    .sort((a, b) => a.dayUtc.localeCompare(b.dayUtc));
}

function useElementSize(element: HTMLDivElement | null): { width: number; height: number } {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!element) {
      return;
    }

    const updateSize = () => {
      const rect = element.getBoundingClientRect();
      setSize({
        width: rect.width > 0 ? Math.floor(rect.width) : 0,
        height: rect.height > 0 ? Math.floor(rect.height) : 0,
      });
    };

    const observer = new ResizeObserver(() => {
      updateSize();
    });
    observer.observe(element);

    const rafId = window.requestAnimationFrame(() => {
      updateSize();
    });

    return () => {
      window.cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [element]);

  return size;
}

export function HomePage() {
  const { locale } = useLocale();
  const td = messages.tenantDashboard;
  const [eventDays, setEventDays] = useState(30);
  const [pieContainer, setPieContainer] = useState<HTMLDivElement | null>(null);
  const [barContainer, setBarContainer] = useState<HTMLDivElement | null>(null);
  const [lineContainer, setLineContainer] = useState<HTMLDivElement | null>(null);
  const { data, loading, error, refetch } = useTenantDashboard(eventDays);
  const pieSize = useElementSize(pieContainer);
  const barSize = useElementSize(barContainer);
  const lineSize = useElementSize(lineContainer);
  const pieReady = pieSize.width > 0 && pieSize.height > 0;
  const barReady = barSize.width > 0 && barSize.height > 0;
  const lineReady = lineSize.width > 0 && lineSize.height > 0;

  if (loading && !data) {
    return (
      <AppShellLayout title={pickLocalized(messages.nav.dashboard, locale)}>
        <DashboardSkeleton />
      </AppShellLayout>
    );
  }

  if (error) {
    const msg = resolveApiErrorMessage(error, locale);
    return (
      <AppShellLayout title={pickLocalized(messages.nav.dashboard, locale)}>
        <ListErrorBanner message={msg} onRetry={() => void refetch()} />
      </AppShellLayout>
    );
  }

  if (!data) {
    return (
      <AppShellLayout title={pickLocalized(messages.nav.dashboard, locale)}>
        <ListErrorBanner
          message={pickLocalized(messages.common.noDataDescription, locale)}
          onRetry={() => void refetch()}
        />
      </AppShellLayout>
    );
  }

  const batchPie = buildBatchPieRows(data, locale);
  const orderBar = buildOrderBarRows(data, locale);
  const eventLine = buildEventLineRows(data);
  const batchTotal = batchPie.reduce((acc, x) => acc + x.count, 0);
  const kpiToneClasses = [
    "border-l-4 border-l-[hsl(var(--chart-1))]",
    "border-l-4 border-l-[hsl(var(--chart-2))]",
    "border-l-4 border-l-[hsl(var(--chart-3))]",
    "border-l-4 border-l-[hsl(var(--chart-4))]",
    "border-l-4 border-l-[hsl(var(--chart-5))]",
    "border-l-4 border-l-[hsl(var(--chart-1))]",
    "border-l-4 border-l-[hsl(var(--chart-2))]",
  ] as const;

  return (
    <AppShellLayout title={pickLocalized(messages.nav.dashboard, locale)}>
      <div className="space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-base font-semibold">
            {pickLocalized(td.sectionKpis, locale)}
          </h2>
          <div className="flex flex-col gap-1 sm:items-end">
            <label htmlFor="dash-event-days" className="text-xs text-muted-foreground">
              {pickLocalized(td.eventRangeLabel, locale)}
            </label>
            <select
              id="dash-event-days"
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm shadow-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring sm:w-44"
              value={eventDays}
              onChange={(e) => {
                const next = Number(e.target.value);
                if (EVENT_DAY_OPTIONS.includes(next as (typeof EVENT_DAY_OPTIONS)[number])) {
                  setEventDays(next);
                }
              }}
            >
              {EVENT_DAY_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <KpiCard
              title={pickLocalized(td.kpi.parties, locale)}
              value={data.kpis.parties}
              toneClass={kpiToneClasses[0]}
            />
            <KpiCard
              title={pickLocalized(td.kpi.locations, locale)}
              value={data.kpis.locations}
              toneClass={kpiToneClasses[1]}
            />
            <KpiCard
              title={pickLocalized(td.kpi.products, locale)}
              value={data.kpis.products}
              toneClass={kpiToneClasses[2]}
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <KpiCard
              title={pickLocalized(td.kpi.certificates, locale)}
              value={data.kpis.certificates}
              toneClass={kpiToneClasses[3]}
            />
            <KpiCard
              title={pickLocalized(td.kpi.productInstances, locale)}
              value={data.kpis.productInstances}
              toneClass={kpiToneClasses[4]}
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <KpiCard
              title={pickLocalized(td.kpi.activeProductionOrders, locale)}
              value={data.kpis.activeProductionOrders}
              toneClass={kpiToneClasses[5]}
            />
            <KpiCard
              title={pickLocalized(td.kpi.batches, locale)}
              value={data.kpis.batches}
              toneClass={kpiToneClasses[6]}
            />
          </div>
        </div>

        <div>
          <h2 className="text-base font-semibold">{pickLocalized(td.sectionCharts, locale)}</h2>
          <div className="mt-4 grid gap-6 xl:grid-cols-2">
            <div className="rounded-lg border bg-card p-5 shadow-sm">
              <p className="text-sm font-medium">{pickLocalized(td.chartBatchesByStatus, locale)}</p>
              <div ref={setPieContainer} className="mt-2 h-[280px] w-full min-w-0 md:h-[300px]">
                {!pieReady ? (
                  <Skeleton className="h-full w-full rounded-md" />
                ) : batchTotal === 0 ? (
                  <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    {pickLocalized(messages.common.noDataTitle, locale)}
                  </p>
                ) : (
                  <PieChart width={pieSize.width} height={pieSize.height} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                    <Pie
                      data={batchPie}
                      dataKey="count"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={92}
                      paddingAngle={3}
                    >
                      {batchPie.map((entry, index) => (
                        <Cell key={entry.key} fill={entry.fill ?? chartFill(index)} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, _name, item) => {
                        const n = typeof value === "number" ? value : Number(value);
                        const label =
                          item &&
                          typeof item === "object" &&
                          "payload" in item &&
                          item.payload &&
                          typeof item.payload === "object" &&
                          "label" in item.payload
                            ? String((item.payload as { label?: string }).label ?? "")
                            : "";
                        return [Number.isFinite(n) ? n : 0, label];
                      }}
                    />
                  </PieChart>
                )}
              </div>
              {batchPie.length > 0 ? (
                <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                  {batchPie.map((item) => (
                    <div key={item.key} className="flex items-center justify-between rounded-md border px-2 py-1">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                        {item.label}
                      </span>
                      <span className="font-semibold tabular-nums">{item.count}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="rounded-lg border bg-card p-5 shadow-sm">
              <p className="text-sm font-medium">{pickLocalized(td.chartOrdersByStatus, locale)}</p>
              <div ref={setBarContainer} className="mt-2 h-[280px] w-full min-w-0 md:h-[300px]">
                {!barReady ? (
                  <Skeleton className="h-full w-full rounded-md" />
                ) : (
                  <BarChart width={barSize.width} height={barSize.height} data={orderBar} layout="vertical" margin={{ top: 8, right: 12, bottom: 8, left: 12 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      width={100}
                    />
                    <Tooltip
                      formatter={(value) => {
                        const n = typeof value === "number" ? value : Number(value);
                        return [Number.isFinite(n) ? n : 0, pickLocalized(td.countAxis, locale)];
                      }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="hsl(var(--chart-3))" />
                  </BarChart>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-lg border bg-card p-5 shadow-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
              <p className="text-sm font-medium">{pickLocalized(td.chartEventsByDay, locale)}</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {interpolateDays(pickLocalized(td.eventsUtcNote, locale), eventDays)}
            </p>
            <div ref={setLineContainer} className="mt-3 h-[260px] w-full min-w-0 md:h-[280px]">
              {!lineReady ? (
                <Skeleton className="h-full w-full rounded-md" />
              ) : (
                <LineChart width={lineSize.width} height={lineSize.height} data={eventLine} margin={{ top: 8, right: 12, bottom: 8, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
                  <XAxis
                    dataKey="dayLabel"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    interval="preserveStartEnd"
                    label={{
                      value: pickLocalized(td.dateAxis, locale),
                      position: "insideBottom",
                      offset: -4,
                      style: { fill: "hsl(var(--muted-foreground))", fontSize: 11 },
                    }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    allowDecimals={false}
                    label={{
                      value: pickLocalized(td.countAxis, locale),
                      angle: -90,
                      position: "insideLeft",
                      style: { fill: "hsl(var(--muted-foreground))", fontSize: 11 },
                    }}
                  />
                  <Tooltip
                    formatter={(value) => {
                      const n = typeof value === "number" ? value : Number(value);
                      return [Number.isFinite(n) ? n : 0, pickLocalized(td.countAxis, locale)];
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={{ r: 2, fill: "hsl(var(--chart-2))" }}
                    connectNulls
                  />
                </LineChart>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShellLayout>
  );
}
