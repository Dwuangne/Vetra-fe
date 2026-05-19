"use client";

import { ChevronLeft } from "lucide-react";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

import { ListErrorBanner } from "@/components/list/list-error-banner";
import { ListLoadingSkeleton } from "@/components/list/list-loading-skeleton";
import { ListPagination } from "@/components/list/list-pagination";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth";
import { getProductById } from "@/lib/api/services/product.service";
import { downloadProductInstanceCsv } from "@/lib/api/services/product-instance.service";
import { canApproveProduction } from "@/lib/auth/roles";
import { messages, pickLocalized, useLocale } from "@/lib/i18n";
import { BRAND_PRIMARY_BUTTON_CLASS } from "@/lib/ui/brand";
import { toastApiError, toastMutationSuccess } from "@/lib/ui/api-toast";

import { useProductInstancePoolList } from "../hooks/use-product-instance-pool-list";
import { ProductInstanceEmptyState } from "./empty-state";
import { PreGenerateInstancesDialog } from "./pre-generate-instances-dialog";
import { ProductInstanceFilters } from "./product-instance-filters";
import { ProductInstancePoolTable } from "./product-instance-pool-table";

type ProductInstancePoolScopeProps = {
  productId: string;
  onChangeScope: () => void;
};

export function ProductInstancePoolScope({ productId, onChangeScope }: ProductInstancePoolScopeProps) {
  const { locale } = useLocale();
  const { user } = useAuth();
  const canManagePool = canApproveProduction(user?.roles);
  const list = useProductInstancePoolList({ productId });
  const [preGenOpen, setPreGenOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [productLabel, setProductLabel] = useState<string | null>(null);
  const autoSearchOnceRef = useRef(false);

  useLayoutEffect(() => {
    if (autoSearchOnceRef.current) return;
    autoSearchOnceRef.current = true;
    list.onSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await getProductById(productId);
        if (cancelled) return;
        const p = res.data;
        if (!p) {
          setProductLabel(null);
          return;
        }
        const parts = [p.name, p.gtin].filter(Boolean);
        setProductLabel(parts.length > 0 ? parts.join(" · ") : productId);
      } catch {
        if (!cancelled) setProductLabel(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const emptyVariant = useMemo((): "filtered-empty" | "no-data" => {
    if (list.hasActiveFilters || list.page > 1) return "filtered-empty";
    return "no-data";
  }, [list.hasActiveFilters, list.page]);

  const filterDisabled = list.initialLoad && list.loading;
  const showEmpty = list.hasSearched && !list.loading && !list.error && list.items.length === 0;

  const runExport = async () => {
    setExporting(true);
    try {
      const { blob, filename } = await downloadProductInstanceCsv({ productId });
      const name = filename ?? `product-instance-pool-${productId}.csv`;
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = name;
      a.click();
      URL.revokeObjectURL(objectUrl);
      toastMutationSuccess(locale);
      list.reload();
    } catch (e) {
      toastApiError(e, locale);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/30 px-4 py-3 text-sm">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={onChangeScope}
            aria-label={pickLocalized(messages.productInstance.changeProduct, locale)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <span className="text-muted-foreground">
              {pickLocalized(messages.productInstance.pool.scopeProduct, locale)}:{" "}
            </span>
            <span className="font-medium">{productLabel ?? productId}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canManagePool ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={exporting}
              onClick={() => void runExport()}
            >
              {exporting
                ? pickLocalized(messages.common.loading, locale)
                : pickLocalized(messages.productInstance.actions.export, locale)}
            </Button>
          ) : (
            <p className="text-xs text-muted-foreground">
              {pickLocalized(messages.productInstance.pool.actions.exportRequiresRole, locale)}
            </p>
          )}
        </div>
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
        {canManagePool ? (
          <Button
            type="button"
            className={BRAND_PRIMARY_BUTTON_CLASS}
            onClick={() => setPreGenOpen(true)}
            disabled={filterDisabled}
          >
            {pickLocalized(messages.productInstance.pool.actions.preGenerate, locale)}
          </Button>
        ) : null}
      </div>

      {list.hasSearched && list.error ? (
        <ListErrorBanner message={list.error} onRetry={() => list.reload()} />
      ) : null}

      {list.hasSearched && list.initialLoad && list.loading ? (
        <ListLoadingSkeleton rows={8} columns={4} />
      ) : null}

      {showEmpty ? (
        <ProductInstanceEmptyState variant={emptyVariant} onClearFilters={() => list.setKeyword("")} />
      ) : null}

      {list.hasSearched && !showEmpty && !list.error ? (
        <ProductInstancePoolTable rows={list.items} locale={locale} loading={list.loading} />
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

      {canManagePool ? (
        <PreGenerateInstancesDialog
          open={preGenOpen}
          onOpenChange={setPreGenOpen}
          productId={productId}
          onPreGenerated={() => {
            list.reload();
          }}
        />
      ) : null}
    </div>
  );
}
