"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

import { ListErrorBanner } from "@/components/list/list-error-banner";
import { ListLoadingSkeleton } from "@/components/list/list-loading-skeleton";
import { ListPagination } from "@/components/list/list-pagination";
import { Button } from "@/components/ui/button";
import { AppShellLayout } from "@/features/home";
import type { ProductionOrderStatus } from "@/lib/api/types/production-order";
import { getBatchById } from "@/lib/api/services/batch.service";
import { getProductById } from "@/lib/api/services/product.service";
import { downloadProductInstanceUrlsCsv } from "@/lib/api/services/product-instance.service";
import { getProductionOrderById } from "@/lib/api/services/production-order.service";
import { messages, pickLocalized, useLocale } from "@/lib/i18n";
import { normalizeBatchStatus } from "@/lib/production/batch-status";
import { toGtin14PathSegment } from "@/lib/production/gtin14";
import { normalizeProductionOrderStatus } from "@/lib/production/production-order-status";
import {
  resolveProductInstancePublicUrlState,
  type ProductInstancePublicUrlState,
} from "@/lib/production/product-instance-public-url";
import { BRAND_PRIMARY_BUTTON_CLASS } from "@/lib/ui/brand";
import { toastApiError, toastMutationSuccess } from "@/lib/ui/api-toast";

import { useProductInstanceList } from "../hooks/use-product-instance-list";
import { ProductInstanceEmptyState } from "./empty-state";
import { GenerateInstancesDialog } from "./generate-instances-dialog";
import { ProductInstanceFilters } from "./product-instance-filters";
import { ProductInstanceTable } from "./product-instance-table";

const GUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseBatchIdParam(raw: string | null): string | null {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) return null;
  return GUID_RE.test(trimmed) ? trimmed : null;
}

function ProductInstanceBatchScope({ batchId }: { batchId: string }) {
  const { locale } = useLocale();
  const list = useProductInstanceList(batchId);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [batchScope, setBatchScope] = useState<{
    lotLabel: string | null;
    gtin14: string | null;
    publicUrlState: ProductInstancePublicUrlState;
  }>({ lotLabel: null, gtin14: null, publicUrlState: "hidden" });
  const autoSearchOnceRef = useRef(false);

  useLayoutEffect(() => {
    if (autoSearchOnceRef.current) return;
    autoSearchOnceRef.current = true;
    list.onSearch();
    // Intentionally once per mount (`batchId` scope remounts via parent `key`).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const batchRes = await getBatchById(batchId);
        if (cancelled) return;
        if (!batchRes.data) {
          setBatchScope({ lotLabel: null, gtin14: null, publicUrlState: "hidden" });
          return;
        }
        const batch = batchRes.data;
        const batchSt = normalizeBatchStatus(batch.status);

        let poStatus: ProductionOrderStatus | null = null;
        if (batch.productionOrderId) {
          const poRes = await getProductionOrderById(batch.productionOrderId);
          if (cancelled) return;
          if (poRes.data) {
            poStatus = normalizeProductionOrderStatus(poRes.data.status);
          }
        }

        const prodRes = await getProductById(batch.productId);
        if (cancelled) return;
        const gtinRaw = prodRes.data?.gtin ?? "";
        const gtin14 = gtinRaw ? toGtin14PathSegment(gtinRaw) : null;
        const publicUrlState = resolveProductInstancePublicUrlState(batchSt, poStatus);

        setBatchScope({
          lotLabel: batch.lotNumber ?? null,
          gtin14,
          publicUrlState,
        });
      } catch {
        if (!cancelled) setBatchScope({ lotLabel: null, gtin14: null, publicUrlState: "hidden" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [batchId]);

  const emptyVariant = useMemo((): "filtered-empty" | "no-data" => {
    if (list.hasActiveFilters || list.page > 1) return "filtered-empty";
    return "no-data";
  }, [list.hasActiveFilters, list.page]);

  const filterDisabled = list.initialLoad && list.loading;
  const showEmpty = list.hasSearched && !list.loading && !list.error && list.items.length === 0;

  const onExportCsv = async () => {
    setExporting(true);
    try {
      const { blob, filename } = await downloadProductInstanceUrlsCsv(batchId);
      const safeLot = (batchScope.lotLabel ?? "batch").replace(/[^\w.-]+/g, "_");
      const fallbackName = `product-instance-urls-${safeLot}.csv`;
      const name = filename ?? fallbackName;
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = name;
      a.click();
      URL.revokeObjectURL(objectUrl);
      toastMutationSuccess(locale);
    } catch (e) {
      toastApiError(e, locale);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/30 px-4 py-3 text-sm">
        <div className="min-w-0 flex-1">
          <span className="text-muted-foreground">{pickLocalized(messages.productInstance.filters.batchId, locale)}: </span>
          <span className="font-medium">{batchScope.lotLabel ?? batchId}</span>
        </div>
        <Button type="button" variant="outline" size="sm" disabled={exporting} onClick={() => void onExportCsv()}>
          {exporting ? pickLocalized(messages.common.loading, locale) : pickLocalized(messages.productInstance.actions.export, locale)}
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <ProductInstanceFilters
          variant="filter-instances"
          keyword={list.keyword}
          onKeywordChange={list.setKeyword}
          onSearch={list.onSearch}
          disabled={filterDisabled}
          locale={locale}
        />
        <Button
          type="button"
          className={BRAND_PRIMARY_BUTTON_CLASS}
          onClick={() => setGenerateOpen(true)}
          disabled={filterDisabled}
        >
          {pickLocalized(messages.productInstance.actions.generate, locale)}
        </Button>
      </div>

      {list.hasSearched && list.error ? (
        <ListErrorBanner message={list.error} onRetry={() => list.reload()} />
      ) : null}

      {list.hasSearched && list.initialLoad && list.loading ? <ListLoadingSkeleton rows={8} columns={4} /> : null}

      {showEmpty ? (
        <ProductInstanceEmptyState variant={emptyVariant} onClearFilters={() => list.setKeyword("")} />
      ) : null}

      {list.hasSearched && !showEmpty && !list.error ? (
        <ProductInstanceTable
          rows={list.items}
          locale={locale}
          loading={list.loading}
          gtin14={batchScope.gtin14}
          publicUrlState={batchScope.publicUrlState}
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

      <GenerateInstancesDialog
        open={generateOpen}
        onOpenChange={setGenerateOpen}
        batchId={batchId}
        onGenerated={() => list.reload()}
      />
    </div>
  );
}

function ProductInstancePageBody() {
  const { locale } = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  const batchId = parseBatchIdParam(searchParams.get("batchId"));

  const title = pickLocalized(messages.productInstance.title, locale);

  return (
    <AppShellLayout title={title}>
      {!batchId ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">{pickLocalized(messages.productInstance.selectBatchPrompt, locale)}</p>
          <ProductInstanceFilters
            variant="pick-batch"
            locale={locale}
            onBatchSelected={(id) => {
              router.push(`/product-instances?batchId=${encodeURIComponent(id)}`);
            }}
          />
        </div>
      ) : (
        <ProductInstanceBatchScope key={batchId} batchId={batchId} />
      )}
    </AppShellLayout>
  );
}

export function ProductInstancePage() {
  return <ProductInstancePageBody />;
}
