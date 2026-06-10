"use client";

import { ListErrorBanner } from "@/components/list/list-error-banner";
import { ListLoadingSkeleton } from "@/components/list/list-loading-skeleton";
import { ListPagination } from "@/components/list/list-pagination";
import { listParties } from "@/lib/api/services/party.service";
import { useAuth } from "@/features/auth";
import { canApproveProduction } from "@/lib/auth/roles";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { LocationDto } from "@/lib/api/types/location";
import { deleteLocation } from "@/lib/api/services/location.service";
import { AppShellLayout } from "@/features/home";
import { messages, pickLocalized, translateCommon, useLocale } from "@/lib/i18n";
import { toastApiError, toastMutationSuccess } from "@/lib/ui/api-toast";
import { BRAND_PRIMARY_BUTTON_CLASS } from "@/lib/ui/brand";
import { useEffect, useMemo, useState } from "react";

import { useLocationList } from "../hooks/use-location-list";
import { LocationEmptyState } from "./empty-state";
import { LocationFilters } from "./location-filters";
import { LocationFormDialog } from "./location-form-dialog";
import { LocationTable } from "./location-table";

export function LocationPage() {
  const { locale } = useLocale();
  const { user } = useAuth();
  const tenantId = user?.tenantId?.trim() || undefined;
  const list = useLocationList();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<LocationDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LocationDto | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [partyNameById, setPartyNameById] = useState<Record<string, string>>({});

  const pageTitle = pickLocalized(messages.location.title, locale);

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
      await deleteLocation(deleteTarget.locationId);
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
        // Tenant scope comes from JWT; do not gate on user.tenantId (often unset in session).
        const res = await listParties({
          page: 1,
          size: 100,
          ...(tenantId ? { tenantId } : {}),
        });
        if (cancelled) return;
        const map = Object.fromEntries((res.data?.items ?? []).map((p) => [p.partyId, p.name]));
        setPartyNameById(map);
      } catch {
        if (!cancelled) setPartyNameById({});
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
          <LocationFilters
            className="w-full md:max-w-4xl"
            keyword={list.keyword}
            onKeywordChange={list.setKeyword}
            onSearch={list.onSearch}
            disabled={filterDisabled}
            locale={locale}
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
              {pickLocalized(messages.location.actions.create, locale)}
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
          <LocationEmptyState variant={emptyVariant} onClearFilters={() => list.setKeyword("")} />
        ) : null}

        {list.hasSearched && !showEmpty && !list.error ? (
          <LocationTable
            rows={list.items}
            locale={locale}
            partyNameById={partyNameById}
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

      <LocationFormDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} onSaved={() => list.reload()} />

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{pickLocalized(messages.location.actions.delete, locale)}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {deleteTarget
              ? deleteTarget.gln?.trim()
                ? `${deleteTarget.name} (${deleteTarget.gln})`
                : deleteTarget.name
              : null}
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
              {pickLocalized(messages.common.cancel, locale)}
            </Button>
            <Button type="button" variant="destructive" disabled={deleting} onClick={() => void confirmDelete()}>
              {pickLocalized(messages.location.actions.delete, locale)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShellLayout>
  );
}
