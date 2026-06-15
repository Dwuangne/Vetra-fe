"use client";

import { useMemo, useState } from "react";

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
import { AppShellLayout } from "@/features/home";
import { deleteAttributeDefinition } from "@/lib/api/services/attribute-definition.service";
import type { AttributeDefinitionDto } from "@/lib/api/types/attribute-definition";
import { canManageConfig } from "@/lib/auth/roles";
import { messages, pickLocalized, translateCommon, useLocale } from "@/lib/i18n";
import { toastApiError, toastMutationSuccess } from "@/lib/ui/api-toast";
import { BRAND_PRIMARY_BUTTON_CLASS } from "@/lib/ui/brand";

import { useAttributeDefinitionList } from "../hooks/use-attribute-definition-list";
import { AttributeDefinitionEmptyState } from "./empty-state";
import { AttributeDefinitionFilters } from "./attribute-definition-filters";
import { AttributeDefinitionFormDialog } from "./attribute-definition-form-dialog";
import { AttributeDefinitionTable } from "./attribute-definition-table";

export function AttributeDefinitionPage() {
  const { locale } = useLocale();
  const { user } = useAuth();
  const list = useAttributeDefinitionList();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AttributeDefinitionDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AttributeDefinitionDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  const pageTitle = pickLocalized(messages.attributeDefinition.title, locale);

  const emptyVariant = useMemo((): "filtered-empty" | "no-data" => {
    if (list.hasActiveFilters || list.hasDataTypeFilter || list.page > 1) return "filtered-empty";
    return "no-data";
  }, [list.hasActiveFilters, list.hasDataTypeFilter, list.page]);

  const showEmpty = list.hasSearched && !list.loading && !list.error && list.items.length === 0;
  const filterDisabled = list.initialLoad && list.loading;
  const canMutate = canManageConfig(user?.roles);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteAttributeDefinition(deleteTarget.attrId);
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
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <AttributeDefinitionFilters
            keyword={list.keyword}
            onKeywordChange={list.setKeyword}
            dataType={list.dataType}
            onDataTypeChange={list.setDataType}
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
              {pickLocalized(messages.attributeDefinition.actions.create, locale)}
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
          <AttributeDefinitionEmptyState
            variant={emptyVariant}
            onClearFilters={() => {
              list.setKeyword("");
              list.setDataType("");
              list.onSearch();
            }}
          />
        ) : null}

        {list.hasSearched && !showEmpty && !list.error ? (
          <AttributeDefinitionTable
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

      <AttributeDefinitionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSaved={() => list.reload()}
      />

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{pickLocalized(messages.attributeDefinition.actions.delete, locale)}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{deleteTarget ? deleteTarget.name : null}</p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
              {pickLocalized(messages.common.cancel, locale)}
            </Button>
            <Button type="button" variant="destructive" disabled={deleting} onClick={() => void confirmDelete()}>
              {pickLocalized(messages.attributeDefinition.actions.delete, locale)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShellLayout>
  );
}
