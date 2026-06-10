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
import { useAuth } from "@/features/auth";
import { canApproveProduction } from "@/lib/auth/roles";
import { AppShellLayout } from "@/features/home";
import { deleteCertificate } from "@/lib/api/services/certificate.service";
import { listLocations } from "@/lib/api/services/location.service";
import { listProducts } from "@/lib/api/services/product.service";
import type { CertificateDto } from "@/lib/api/types/certificate";
import type { LocationDto } from "@/lib/api/types/location";
import type { ProductDto } from "@/lib/api/types/product";
import { messages, pickLocalized, translateCommon, useLocale } from "@/lib/i18n";
import { toastApiError, toastMutationSuccess } from "@/lib/ui/api-toast";
import { BRAND_PRIMARY_BUTTON_CLASS } from "@/lib/ui/brand";
import { useEffect, useMemo, useState } from "react";

import { useCertificateList } from "../hooks/use-certificate-list";
import { CertificateEmptyState } from "./empty-state";
import { CertificateFilters } from "./certificate-filters";
import { CertificateFormDialog } from "./certificate-form-dialog";
import { CertificateTable } from "./certificate-table";

export function CertificatePage() {
  const { locale } = useLocale();
  const { user } = useAuth();
  const tenantId = user?.tenantId?.trim() || undefined;
  const list = useCertificateList();
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [locations, setLocations] = useState<LocationDto[]>([]);
  const [productNameById, setProductNameById] = useState<Record<string, string>>({});
  const [locationNameById, setLocationNameById] = useState<Record<string, string>>({});
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CertificateDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CertificateDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  const pageTitle = pickLocalized(messages.certificate.title, locale);

  const emptyVariant = useMemo((): "filtered-empty" | "no-data" => {
    if (list.hasActiveFilters || list.hasProductFilter || list.hasLocationFilter || list.page > 1) return "filtered-empty";
    return "no-data";
  }, [list.hasActiveFilters, list.hasProductFilter, list.hasLocationFilter, list.page]);

  const showEmpty = list.hasSearched && !list.loading && !list.error && list.items.length === 0;
  const filterDisabled = list.initialLoad && list.loading;
  const canMutate = canApproveProduction(user?.roles);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCertificate(deleteTarget.certificateId);
      toastMutationSuccess(locale);
      setDeleteTarget(null);
      list.reload();
    } catch (e) {
      toastApiError(e, locale);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [res, locRes] = await Promise.all([
          listProducts({ page: 1, size: 200, tenantId }),
          listLocations({ page: 1, size: 200, tenantId }),
        ]);
        if (cancelled) return;
        const items = res.data?.items ?? [];
        const locItems = locRes.data?.items ?? [];
        setProducts(items);
        setLocations(locItems);
        setProductNameById(Object.fromEntries(items.map((p) => [p.productId, p.name])));
        setLocationNameById(Object.fromEntries(locItems.map((l) => [l.locationId, l.name])));
      } catch {
        if (!cancelled) {
          setProducts([]);
          setLocations([]);
          setProductNameById({});
          setLocationNameById({});
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tenantId]);

  return (
    <AppShellLayout title={pageTitle}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <CertificateFilters
            keyword={list.keyword}
            onKeywordChange={list.setKeyword}
            productId={list.productId}
            onProductIdChange={list.setProductId}
            locationId={list.locationId}
            onLocationIdChange={list.setLocationId}
            tenantId={tenantId}
            onSearch={list.onSearch}
            disabled={filterDisabled}
            locale={locale}
            className="w-full md:max-w-4xl"
          />
          {canMutate ? (
            <Button
              type="button"
              className={`${BRAND_PRIMARY_BUTTON_CLASS} w-full md:w-auto md:shrink-0`}
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              disabled={filterDisabled}
            >
              {pickLocalized(messages.certificate.actions.create, locale)}
            </Button>
          ) : null}
        </div>

        {!list.hasSearched ? (
          <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
            {translateCommon("searchPrompt", locale)}
          </div>
        ) : null}

        {list.hasSearched && list.error ? (
          <ListErrorBanner message={list.error} onRetry={() => list.reload()} />
        ) : null}

        {list.hasSearched && list.initialLoad && list.loading ? (
          <ListLoadingSkeleton rows={8} columns={5} />
        ) : null}

        {showEmpty ? (
          <CertificateEmptyState
            variant={emptyVariant}
            onClearFilters={() => {
              list.setKeyword("");
              list.setProductId("");
              list.setLocationId("");
            }}
          />
        ) : null}

        {list.hasSearched && !showEmpty && !list.error ? (
          <CertificateTable
            rows={list.items}
            locale={locale}
            productNameById={productNameById}
            locationNameById={locationNameById}
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

      <CertificateFormDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} onSaved={() => list.reload()} />

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{pickLocalized(messages.certificate.actions.delete, locale)}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {deleteTarget ? deleteTarget.name : null}
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
              {pickLocalized(messages.common.cancel, locale)}
            </Button>
            <Button type="button" variant="destructive" disabled={deleting} onClick={() => void confirmDelete()}>
              {pickLocalized(messages.certificate.actions.delete, locale)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShellLayout>
  );
}
