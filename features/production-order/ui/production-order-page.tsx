"use client";

import { useEffect, useMemo, useState } from "react";

import { ListErrorBanner } from "@/components/list/list-error-banner";
import { ListLoadingSkeleton } from "@/components/list/list-loading-skeleton";
import { ListPagination } from "@/components/list/list-pagination";
import { Button } from "@/components/ui/button";
import { AppShellLayout } from "@/features/home";
import { listProducts } from "@/lib/api/services/product.service";
import { transitionProductionOrderStatus } from "@/lib/api/services/production-order.service";
import type { ProductionOrderStatus } from "@/lib/api/types/production-order";
import {
  normalizeProductionOrderStatus,
  productionOrderStatusToApiNumber,
} from "@/lib/production/production-order-status";
import { getNextProductionOrderStatuses } from "@/lib/production/status-transitions";
import { messages, pickLocalized, useLocale } from "@/lib/i18n";
import { toastApiError, toastMutationSuccess } from "@/lib/ui/api-toast";
import { BRAND_PRIMARY_BUTTON_CLASS } from "@/lib/ui/brand";

import { useProductionOrderList } from "../hooks/use-production-order-list";
import type { ProductionOrderListRowVm } from "../model/production-order.types";
import { ProductionOrderEmptyState } from "./empty-state";
import { ProductionOrderFilters } from "./production-order-filters";
import { ProductionOrderFormDialog } from "./production-order-form-dialog";
import { ProductionOrderStatusDialog } from "./production-order-status-dialog";
import { ProductionOrderTable } from "./production-order-table";

export function ProductionOrderPage() {
  const { locale } = useLocale();
  const list = useProductionOrderList();
  const [formOpen, setFormOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [transitionTarget, setTransitionTarget] = useState<{
    row: ProductionOrderListRowVm;
    nextStatus: ProductionOrderStatus;
  } | null>(null);
  const [productNameById, setProductNameById] = useState<Record<string, string>>({});

  const pageTitle = pickLocalized(messages.productionOrder.title, locale);
  const emptyVariant = useMemo((): "filtered-empty" | "no-data" => {
    if (list.hasActiveFilters || list.page > 1) return "filtered-empty";
    return "no-data";
  }, [list.hasActiveFilters, list.page]);

  const showEmpty = list.hasSearched && !list.loading && !list.error && list.items.length === 0;
  const filterDisabled = list.initialLoad && list.loading;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await listProducts({ page: 1, size: 200 });
        if (cancelled) return;
        setProductNameById(Object.fromEntries((res.data?.items ?? []).map((item) => [item.productId, item.name])));
      } catch {
        if (!cancelled) setProductNameById({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onTransitionSelected = (row: ProductionOrderListRowVm, nextStatus: ProductionOrderStatus) => {
    setTransitionTarget({ row, nextStatus });
    setStatusDialogOpen(true);
  };

  const confirmTransition = async (payload: { nextStatus: ProductionOrderStatus; actualQuantity?: number | null }) => {
    if (!transitionTarget) return;
    setTransitioning(true);
    try {
      await transitionProductionOrderStatus(transitionTarget.row.productionOrderId, {
        nextStatus: productionOrderStatusToApiNumber(payload.nextStatus),
        ...(payload.actualQuantity != null ? { actualQuantity: payload.actualQuantity } : {}),
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
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ProductionOrderFilters
            keyword={list.keyword}
            onKeywordChange={list.setKeyword}
            onSearch={list.onSearch}
            disabled={filterDisabled}
            locale={locale}
          />
          <Button
            type="button"
            className={BRAND_PRIMARY_BUTTON_CLASS}
            onClick={() => setFormOpen(true)}
            disabled={filterDisabled}
          >
            {pickLocalized(messages.productionOrder.actions.create, locale)}
          </Button>
        </div>

        {!list.hasSearched ? (
          <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
            Enter filter keyword and click Search to load data.
          </div>
        ) : null}

        {list.hasSearched && list.error ? (
          <ListErrorBanner message={list.error} onRetry={() => list.reload()} />
        ) : null}

        {list.hasSearched && list.initialLoad && list.loading ? <ListLoadingSkeleton rows={8} columns={8} /> : null}

        {showEmpty ? (
          <ProductionOrderEmptyState variant={emptyVariant} onClearFilters={() => list.setKeyword("")} />
        ) : null}

        {list.hasSearched && !showEmpty && !list.error ? (
          <ProductionOrderTable
            rows={list.items}
            locale={locale}
            productNameById={productNameById}
            loading={list.loading}
            disabled={list.loading}
            resolveNextStatuses={getNextProductionOrderStatuses}
            onTransition={onTransitionSelected}
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
      </div>

      <ProductionOrderFormDialog open={formOpen} onOpenChange={setFormOpen} onSaved={() => list.reload()} />

      <ProductionOrderStatusDialog
        open={statusDialogOpen}
        currentStatus={normalizeProductionOrderStatus(transitionTarget?.row.status)}
        nextStatus={transitionTarget?.nextStatus ?? null}
        loading={transitioning}
        onOpenChange={(open) => {
          setStatusDialogOpen(open);
          if (!open) setTransitionTarget(null);
        }}
        onConfirm={confirmTransition}
      />
    </AppShellLayout>
  );
}
