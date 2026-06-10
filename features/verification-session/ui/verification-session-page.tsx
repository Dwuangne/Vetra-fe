"use client";

import { useEffect, useMemo, useState } from "react";

import { ListErrorBanner } from "@/components/list/list-error-banner";
import { ListLoadingSkeleton } from "@/components/list/list-loading-skeleton";
import { ListPagination } from "@/components/list/list-pagination";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth";
import { AppShellLayout } from "@/features/home";
import { listBatches } from "@/lib/api/services/batch.service";
import { listProducts } from "@/lib/api/services/product.service";
import { canApproveProduction } from "@/lib/auth/roles";
import { messages, pickLocalized, useLocale } from "@/lib/i18n";
import { BRAND_PRIMARY_BUTTON_CLASS } from "@/lib/ui/brand";

import { useVerificationSessionList } from "../hooks/use-verification-session-list";
import { VerificationSessionEmptyState } from "./empty-state";
import { OpenVerificationSessionDialog } from "./open-verification-session-dialog";
import { VerificationSessionDetailDialog } from "./verification-session-detail-dialog";
import { VerificationSessionFilters } from "./verification-session-filters";
import { VerificationSessionTable } from "./verification-session-table";

export function VerificationSessionPage() {
  const { locale } = useLocale();
  const { user } = useAuth();
  const list = useVerificationSessionList();
  const canManage = canApproveProduction(user?.roles);
  const [openDialog, setOpenDialog] = useState(false);
  const [detailSessionId, setDetailSessionId] = useState<string | null>(null);
  const [batchLabelById, setBatchLabelById] = useState<Record<string, string>>({});
  const [productLabelById, setProductLabelById] = useState<Record<string, string>>({});

  const pageTitle = pickLocalized(messages.verificationSession.title, locale);
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
        const [batchesRes, productsRes] = await Promise.all([
          listBatches({ page: 1, size: 200 }),
          listProducts({ page: 1, size: 200 }),
        ]);
        if (cancelled) return;
        setBatchLabelById(
          Object.fromEntries((batchesRes.data?.items ?? []).map((b) => [b.batchId, b.lotNumber]))
        );
        setProductLabelById(
          Object.fromEntries(
            (productsRes.data?.items ?? []).map((p) => [p.productId, p.name || p.gtin || p.productId])
          )
        );
      } catch {
        if (!cancelled) {
          setBatchLabelById({});
          setProductLabelById({});
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const detailBatchLabel = detailSessionId
    ? batchLabelById[list.items.find((s) => s.sessionId === detailSessionId)?.batchId ?? ""] ??
      undefined
    : undefined;
  const detailProductLabel = detailSessionId
    ? productLabelById[list.items.find((s) => s.sessionId === detailSessionId)?.productId ?? ""] ??
      undefined
    : undefined;

  return (
    <AppShellLayout title={pageTitle}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">{pickLocalized(messages.verificationSession.hint, locale)}</p>

        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <VerificationSessionFilters
            className="w-full md:max-w-4xl"
            batchId={list.batchId}
            productId={list.productId}
            onBatchIdChange={list.setBatchId}
            onProductIdChange={list.setProductId}
            onSearch={list.onSearch}
            disabled={filterDisabled}
            locale={locale}
          />
          {canManage ? (
            <Button
              type="button"
              className={`${BRAND_PRIMARY_BUTTON_CLASS} w-full md:w-auto md:shrink-0`}
              onClick={() => setOpenDialog(true)}
              disabled={filterDisabled}
            >
              {pickLocalized(messages.verificationSession.actions.openSession, locale)}
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
          <ListLoadingSkeleton rows={8} columns={5} />
        ) : null}

        {showEmpty ? (
          <VerificationSessionEmptyState
            variant={emptyVariant}
            onClearFilters={() => {
              list.setBatchId("");
              list.setProductId("");
              list.onSearch();
            }}
          />
        ) : null}

        {list.hasSearched && !showEmpty && !list.error ? (
          <VerificationSessionTable
            rows={list.items}
            locale={locale}
            loading={list.loading}
            batchLabelById={batchLabelById}
            productLabelById={productLabelById}
            onViewLog={(sessionId) => setDetailSessionId(sessionId)}
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

        {canManage ? (
          <OpenVerificationSessionDialog
            open={openDialog}
            onOpenChange={setOpenDialog}
            onOpened={() => list.reload()}
          />
        ) : null}

        <VerificationSessionDetailDialog
          sessionId={detailSessionId}
          open={detailSessionId !== null}
          onOpenChange={(next) => {
            if (!next) setDetailSessionId(null);
          }}
          canCancel={canManage}
          batchLabel={detailBatchLabel}
          productLabel={detailProductLabel}
          onSessionUpdated={() => list.reload()}
        />
      </div>
    </AppShellLayout>
  );
}
