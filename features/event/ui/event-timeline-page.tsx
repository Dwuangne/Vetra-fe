"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { DatetimeInput } from "@/components/forms/datetime-input";
import { ListErrorBanner } from "@/components/list/list-error-banner";
import { ListLoadingSkeleton } from "@/components/list/list-loading-skeleton";
import { ListPagination } from "@/components/list/list-pagination";
import { Button } from "@/components/ui/button";
import { AppShellLayout } from "@/features/home";
import { listLocations } from "@/lib/api/services/location.service";
import { messages, pickLocalized, translateCommon, useLocale } from "@/lib/i18n";
import { BRAND_PRIMARY_BUTTON_CLASS } from "@/lib/ui/brand";

import { parseEventTimelineSearchParams, useEventTimeline } from "../hooks/use-event-timeline";
import { EventDetailDialog } from "./event-detail-dialog";
import { EventIngestDialog } from "./event-ingest-dialog";
import { EventTimelineEmptyState } from "./empty-state";
import { EventTimelineFilters } from "./event-timeline-filters";
import { EventTimelineTable } from "./event-timeline-table";

export function EventTimelinePage() {
  const { locale } = useLocale();
  const searchParams = useSearchParams();
  const initialFilters = useMemo(
    () => parseEventTimelineSearchParams(searchParams),
    [searchParams]
  );
  const list = useEventTimeline(initialFilters);
  const [detailEventId, setDetailEventId] = useState<string | null>(null);
  const [ingestOpen, setIngestOpen] = useState(false);
  const [locationNameById, setLocationNameById] = useState<Record<string, string>>({});

  const pageTitle = pickLocalized(messages.event.title, locale);
  const timeFilters = messages.event.filters;
  const emptyVariant = useMemo((): "filtered-empty" | "no-data" => {
    if (list.hasActiveFilters || list.page > 1) return "filtered-empty";
    return "no-data";
  }, [list.hasActiveFilters, list.page]);

  const showEmpty = list.hasSearched && !list.loading && !list.error && list.items.length === 0;
  const filterDisabled = list.initialLoad && list.loading;
  const showPreSearchError = !list.hasSearched && list.error;

  useEffect(() => {
    if (!list.hasSearched) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await listLocations({ page: 1, size: 200 });
        if (cancelled) return;
        setLocationNameById(
          Object.fromEntries(
            (res.data?.items ?? []).map((l) => [l.locationId, l.name || l.gln || l.locationId])
          )
        );
      } catch {
        if (!cancelled) setLocationNameById({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [list.hasSearched]);

  return (
    <AppShellLayout title={pageTitle}>
      <div className="flex flex-col gap-4">
        <EventTimelineFilters
          lotKeyword={list.lotKeyword}
          productionOrderId={list.productionOrderId}
          locationId={list.locationId}
          epcUri={list.epcUri}
          batchId={list.batchId}
          onLotKeywordChange={list.setLotKeyword}
          onProductionOrderIdChange={list.setProductionOrderId}
          onLocationIdChange={list.setLocationId}
          onEpcUriChange={list.setEpcUri}
          onBatchIdChange={list.setBatchId}
          onSearch={list.onSearch}
          disabled={filterDisabled}
          locale={locale}
        />

        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex min-w-[180px] max-w-xs flex-col gap-2">
              <label className="text-sm font-medium leading-none">
                {pickLocalized(timeFilters.fromTime, locale)}
              </label>
              <DatetimeInput
                value={list.fromTime || null}
                onValueChange={(value) => list.setFromTime(value ?? "")}
                disabled={filterDisabled}
              />
            </div>
            <div className="flex min-w-[180px] max-w-xs flex-col gap-2">
              <label className="text-sm font-medium leading-none">
                {pickLocalized(timeFilters.toTime, locale)}
              </label>
              <DatetimeInput
                value={list.toTime || null}
                onValueChange={(value) => list.setToTime(value ?? "")}
                disabled={filterDisabled}
              />
            </div>
          </div>
          <Button
            type="button"
            className={`${BRAND_PRIMARY_BUTTON_CLASS} w-full md:w-auto md:shrink-0`}
            onClick={() => setIngestOpen(true)}
            disabled={filterDisabled}
          >
            {pickLocalized(messages.event.actions.ingest, locale)}
          </Button>
        </div>

        {!list.hasSearched && !showPreSearchError ? (
          <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
            {translateCommon("searchPrompt", locale)}
          </div>
        ) : null}

        {showPreSearchError ? (
          <ListErrorBanner message={list.error!} onRetry={() => list.onSearch()} />
        ) : null}

        {list.hasSearched && list.error ? (
          <ListErrorBanner message={list.error} onRetry={() => list.reload()} />
        ) : null}

        {list.hasSearched && list.initialLoad && list.loading ? (
          <ListLoadingSkeleton rows={8} columns={8} />
        ) : null}

        {showEmpty ? (
          <EventTimelineEmptyState
            variant={emptyVariant}
            onClearFilters={() => list.clearFilters()}
          />
        ) : null}

        {list.hasSearched && !showEmpty && !list.error ? (
          <EventTimelineTable
            rows={list.items}
            locale={locale}
            loading={list.loading}
            locationNameById={locationNameById}
            onViewDetail={setDetailEventId}
          />
        ) : null}

        {list.hasSearched && !showEmpty && !list.error ? (
          <ListPagination
            page={list.page}
            totalPages={list.totalPages}
            loading={list.loading}
            disabled={filterDisabled}
            onPrev={() => list.setPage((p) => Math.max(1, p - 1))}
            onNext={() => list.setPage((p) => Math.min(list.totalPages, p + 1))}
          />
        ) : null}

        <EventDetailDialog
          eventId={detailEventId}
          open={detailEventId !== null}
          onOpenChange={(open) => {
            if (!open) setDetailEventId(null);
          }}
          locationNameById={locationNameById}
        />

        <EventIngestDialog
          open={ingestOpen}
          onOpenChange={setIngestOpen}
          onIngested={() => list.reload()}
        />
      </div>
    </AppShellLayout>
  );
}
