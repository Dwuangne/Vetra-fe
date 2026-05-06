"use client";

import { ListErrorBanner } from "@/components/list/list-error-banner";
import { ListLoadingSkeleton } from "@/components/list/list-loading-skeleton";
import { ListPagination } from "@/components/list/list-pagination";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ProductDto } from "@/lib/api/types/product";
import { deleteProduct } from "@/lib/api/services/product.service";
import { AppShellLayout } from "@/features/home";
import { useAuth } from "@/features/auth";
import { canApproveProduction } from "@/lib/auth/roles";
import { messages, pickLocalized, useLocale } from "@/lib/i18n";
import { toastApiError, toastMutationSuccess } from "@/lib/ui/api-toast";
import { BRAND_PRIMARY_BUTTON_CLASS } from "@/lib/ui/brand";
import { useMemo, useState } from "react";

import { useProductList } from "../hooks/use-product-list";
import { ProductEmptyState } from "./empty-state";
import { ProductFilters } from "./product-filters";
import { ProductFormDialog } from "./product-form-dialog";
import { ProductTable } from "./product-table";

export function ProductPage() {
  const { locale } = useLocale();
  const { user } = useAuth();
  const list = useProductList();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProductDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  const pageTitle = pickLocalized(messages.product.title, locale);

  const emptyVariant = useMemo((): "filtered-empty" | "no-data" => {
    if (list.hasActiveFilters || list.page > 1) return "filtered-empty";
    return "no-data";
  }, [list.hasActiveFilters, list.page]);

  const showEmpty = list.hasSearched && !list.loading && !list.error && list.items.length === 0;
  const filterDisabled = list.initialLoad && list.loading;
  const canMutate = canApproveProduction(user?.roles);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget.productId);
      toastMutationSuccess(locale);
      setDeleteTarget(null);
      list.reload();
    } catch (e) {
      toastApiError(e, locale);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AppShellLayout title={pageTitle}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ProductFilters
            keyword={list.keyword}
            onKeywordChange={list.setKeyword}
            onSearch={list.onSearch}
            disabled={filterDisabled}
            locale={locale}
          />
          {canMutate ? (
            <Button
              type="button"
              className={BRAND_PRIMARY_BUTTON_CLASS}
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              disabled={filterDisabled}
            >
              {pickLocalized(messages.product.actions.create, locale)}
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
          <ListLoadingSkeleton rows={8} columns={6} />
        ) : null}

        {showEmpty ? (
          <ProductEmptyState variant={emptyVariant} onClearFilters={() => list.setKeyword("")} />
        ) : null}

        {list.hasSearched && !showEmpty && !list.error ? (
          <ProductTable
            rows={list.items}
            locale={locale}
            loading={list.loading}
            disabled={list.loading}
            onEdit={
              canMutate
                ? (row) => {
                    setEditing(row);
                    setFormOpen(true);
                  }
                : undefined
            }
            onDelete={canMutate ? (row) => setDeleteTarget(row) : undefined}
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

      <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} onSaved={() => list.reload()} />

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{pickLocalized(messages.product.actions.delete, locale)}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {deleteTarget ? `${deleteTarget.name} (${deleteTarget.gtin})` : null}
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" disabled={deleting} onClick={() => void confirmDelete()}>
              {pickLocalized(messages.product.actions.delete, locale)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShellLayout>
  );
}
