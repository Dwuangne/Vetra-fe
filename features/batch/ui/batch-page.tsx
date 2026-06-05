"use client";

import { useEffect, useMemo, useState } from "react";

import { ListErrorBanner } from "@/components/list/list-error-banner";
import { ListLoadingSkeleton } from "@/components/list/list-loading-skeleton";
import { ListPagination } from "@/components/list/list-pagination";
import { Button } from "@/components/ui/button";
import { AppShellLayout } from "@/features/home";
import { useAuth } from "@/features/auth";
import { canApproveProduction } from "@/lib/auth/roles";
import { listProducts } from "@/lib/api/services/product.service";
import { listProductionOrders } from "@/lib/api/services/production-order.service";
import { transitionBatchStatus } from "@/lib/api/services/batch.service";
import type { BatchStatus } from "@/lib/api/types/batch";
import { messages, pickLocalized, useLocale } from "@/lib/i18n";
import { batchStatusToApiNumber, normalizeBatchStatus } from "@/lib/production/batch-status";
import { getNextBatchStatuses } from "@/lib/production/status-transitions";
import { toastApiError, toastMutationSuccess } from "@/lib/ui/api-toast";
import { BRAND_PRIMARY_BUTTON_CLASS } from "@/lib/ui/brand";

import { useBatchList } from "../hooks/use-batch-list";
import type { BatchListRowVm } from "../model/batch.types";
import { BatchEmptyState } from "./empty-state";
import { BatchFilters } from "./batch-filters";
import { BatchFormDialog } from "./batch-form-dialog";
import { BatchStatusDialog } from "./batch-status-dialog";
import { BatchTable } from "./batch-table";

export function BatchPage() {
  const { locale } = useLocale();
  const { user } = useAuth();
  const list = useBatchList();
  const [formOpen, setFormOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [transitionTarget, setTransitionTarget] = useState<{
    row: BatchListRowVm;
    nextStatus: BatchStatus;
  } | null>(null);
  const [productNameById, setProductNameById] = useState<Record<string, string>>({});
  const [orderNumberById, setOrderNumberById] = useState<Record<string, string>>({});

  const pageTitle = pickLocalized(messages.batch.title, locale);
  const emptyVariant = useMemo((): "filtered-empty" | "no-data" => {
    if (list.hasActiveFilters || list.page > 1) return "filtered-empty";
    return "no-data";
  }, [list.hasActiveFilters, list.page]);

  const showEmpty = list.hasSearched && !list.loading && !list.error && list.items.length === 0;
  const filterDisabled = list.initialLoad && list.loading;
  const canTransition = canApproveProduction(user?.roles);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [productsRes, ordersRes] = await Promise.all([
          listProducts({ page: 1, size: 200 }),
          listProductionOrders({ page: 1, size: 200 }),
        ]);
        if (cancelled) return;
        setProductNameById(Object.fromEntries((productsRes.data?.items ?? []).map((item) => [item.productId, item.name])));
        setOrderNumberById(
          Object.fromEntries((ordersRes.data?.items ?? []).map((item) => [item.productionOrderId, item.orderNumber]))
        );
      } catch {
        if (!cancelled) {
          setProductNameById({});
          setOrderNumberById({});
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onTransitionSelected = (row: BatchListRowVm, nextStatus: BatchStatus) => {
    setTransitionTarget({ row, nextStatus });
    setStatusDialogOpen(true);
  };

  const confirmTransition = async (payload: { nextStatus: BatchStatus; releasedQuantity?: number | null }) => {
    if (!transitionTarget) return;
    setTransitioning(true);
    try {
      await transitionBatchStatus(transitionTarget.row.batchId, {
        nextStatus: batchStatusToApiNumber(payload.nextStatus),
        ...(payload.releasedQuantity != null ? { releasedQuantity: payload.releasedQuantity } : {}),
      });
      toastMutationSuccess(locale);
      setStatusDialogOpen(false);
      setTransitionTarget(null);
      list.reload();
    } catch (e) {
      toastApiError(e, locale);
    } finally {
      setTransitioning(false);
    }
  };

  return (
    <AppShellLayout title={pageTitle}>
      <div className="flex w-full min-w-0 max-w-full flex-col gap-4 overflow-x-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <BatchFilters
            className="min-w-0 flex-1 basis-full sm:basis-auto"
            keyword={list.keyword}
            onKeywordChange={list.setKeyword}
            onSearch={list.onSearch}
            disabled={filterDisabled}
            locale={locale}
          />
          {canTransition ? (
            <Button
              type="button"
              className={`${BRAND_PRIMARY_BUTTON_CLASS} shrink-0`}
              onClick={() => setFormOpen(true)}
              disabled={filterDisabled}
            >
              {pickLocalized(messages.batch.actions.create, locale)}
            </Button>
          ) : null}
        </div>

        {!list.hasSearched ? (
          <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
            Enter filter keyword and click Search to load data.
          </div>
        ) : null}

        {list.hasSearched && list.error ? (
          <ListErrorBanner message={list.error} onRetry={() => list.reload()} />
        ) : null}

        {list.hasSearched && list.initialLoad && list.loading ? (
          <ListLoadingSkeleton className="min-w-0 max-w-full" rows={8} columns={8} />
        ) : null}

        {showEmpty ? (
          <BatchEmptyState variant={emptyVariant} onClearFilters={() => list.setKeyword("")} />
        ) : null}

        {list.hasSearched && !showEmpty && !list.error ? (
          <div className="min-w-0 max-w-full">
            <BatchTable
              rows={list.items}
              locale={locale}
              productNameById={productNameById}
              orderNumberById={orderNumberById}
              loading={list.loading}
              disabled={list.loading}
              resolveNextStatuses={getNextBatchStatuses}
              onTransition={canTransition ? onTransitionSelected : undefined}
            />
          </div>
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
      </div>

      <BatchFormDialog open={formOpen} onOpenChange={setFormOpen} onSaved={() => list.reload()} />

      {canTransition ? (
        <BatchStatusDialog
          open={statusDialogOpen}
          batchId={transitionTarget?.row.batchId ?? null}
          currentStatus={normalizeBatchStatus(transitionTarget?.row.status)}
          nextStatus={transitionTarget?.nextStatus ?? null}
          loading={transitioning}
          onOpenChange={(open) => {
            setStatusDialogOpen(open);
            if (!open) setTransitionTarget(null);
          }}
          onConfirm={confirmTransition}
        />
      ) : null}
    </AppShellLayout>
  );
}
