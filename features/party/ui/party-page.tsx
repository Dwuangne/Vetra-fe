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
import type { PartyDto } from "@/lib/api/types/party";
import { deleteParty } from "@/lib/api/services/party.service";
import { AppShellLayout } from "@/features/home";
import { useAuth } from "@/features/auth";
import { messages, pickLocalized, translateCommon, useLocale } from "@/lib/i18n";
import { toastApiError, toastMutationSuccess } from "@/lib/ui/api-toast";
import { BRAND_PRIMARY_BUTTON_CLASS } from "@/lib/ui/brand";
import { useMemo, useState } from "react";

import { usePartyList } from "../hooks/use-party-list";
import { PartyEmptyState } from "./empty-state";
import { PartyFilters } from "./party-filters";
import { PartyFormDialog } from "./party-form-dialog";
import { PartyTable } from "./party-table";
import { canApproveProduction } from "@/lib/auth/roles";

export function PartyPage() {
  const { locale } = useLocale();
  const { user } = useAuth();
  const list = usePartyList();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PartyDto | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<PartyDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  const pageTitle = pickLocalized(messages.party.title, locale);

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
      await deleteParty(deleteTarget.partyId);
      toastMutationSuccess(locale);
      setDeleteTarget(null);
      list.reload();
    } catch (e) {
      toastApiError(e, locale);
    } finally {
      setDeleting(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (row: PartyDto) => {
    setEditing(row);
    setFormOpen(true);
  };

  return (
    <AppShellLayout title={pageTitle}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <PartyFilters
            className="w-full md:max-w-4xl"
            keyword={list.keyword}
            onKeywordChange={list.setKeyword}
            onSearch={list.onSearch}
            disabled={filterDisabled}
            locale={locale}
          />
          {canMutate ? (
            <Button type="button" className={`${BRAND_PRIMARY_BUTTON_CLASS} w-full md:w-auto md:shrink-0`} onClick={openCreate} disabled={filterDisabled}>
              {pickLocalized(messages.party.actions.create, locale)}
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
          <ListLoadingSkeleton rows={8} columns={3} />
        ) : null}

        {showEmpty ? (
          <PartyEmptyState variant={emptyVariant} onClearFilters={() => list.setKeyword("")} />
        ) : null}

        {list.hasSearched && !showEmpty && !list.error ? (
          <PartyTable
            rows={list.items}
            locale={locale}
            loading={list.loading}
            disabled={list.loading}
            onEdit={canMutate ? openEdit : undefined}
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

      <PartyFormDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} onSaved={() => list.reload()} />

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{pickLocalized(messages.party.actions.delete, locale)}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {deleteTarget ? `${deleteTarget.name} (${deleteTarget.gln})` : null}
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
              {pickLocalized(messages.common.cancel, locale)}
            </Button>
            <Button type="button" variant="destructive" disabled={deleting} onClick={() => void confirmDelete()}>
              {pickLocalized(messages.party.actions.delete, locale)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShellLayout>
  );
}
