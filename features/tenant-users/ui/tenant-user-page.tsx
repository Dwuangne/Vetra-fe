"use client";

import type { TenantUserSummaryDto } from "@/lib/api/types/tenant-user";
import {
  disableTenantUser,
  enableTenantUser,
} from "@/lib/api/services/tenant-user.service";
import { ListErrorBanner } from "@/components/list/list-error-banner";
import { ListLoadingSkeleton } from "@/components/list/list-loading-skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppShellLayout } from "@/features/home";
import { messages, pickLocalized, useLocale } from "@/lib/i18n";
import { toastApiError, toastMutationSuccess } from "@/lib/ui/api-toast";
import { BRAND_PRIMARY_BUTTON_CLASS } from "@/lib/ui/brand";
import { useState } from "react";

import { useTenantUserList } from "../hooks/use-tenant-user-list";
import { TenantUserCreateDialog } from "./tenant-user-create-dialog";
import { TenantUserEmptyState } from "./tenant-user-empty-state";
import { TenantUserResetPasswordDialog } from "./tenant-user-reset-password-dialog";
import { TenantUserTable } from "./tenant-user-table";

export function TenantUserPage() {
  const { locale } = useLocale();
  const list = useTenantUserList();
  const [createOpen, setCreateOpen] = useState(false);
  const [disableTarget, setDisableTarget] = useState<TenantUserSummaryDto | null>(null);
  const [disabling, setDisabling] = useState(false);
  const [resetTarget, setResetTarget] = useState<TenantUserSummaryDto | null>(null);

  const pageTitle = pickLocalized(messages.tenantUser.title, locale);
  const d = messages.tenantUser.dialogs;

  const showEmpty = !list.loading && !list.error && list.items.length === 0;
  const showTable = !list.error && !showEmpty;

  const confirmDisable = async () => {
    if (!disableTarget) return;
    setDisabling(true);
    try {
      await disableTenantUser(disableTarget.userId);
      toastMutationSuccess(locale);
      setDisableTarget(null);
      await list.reload();
    } catch (e: unknown) {
      toastApiError(e, locale);
    } finally {
      setDisabling(false);
    }
  };

  const handleEnable = async (row: TenantUserSummaryDto) => {
    try {
      await enableTenantUser(row.userId);
      toastMutationSuccess(locale);
      await list.reload();
    } catch (e: unknown) {
      toastApiError(e, locale);
    }
  };

  return (
    <AppShellLayout title={pageTitle}>
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <Button
            type="button"
            className={BRAND_PRIMARY_BUTTON_CLASS}
            onClick={() => setCreateOpen(true)}
            disabled={!!list.loading}
          >
            {pickLocalized(messages.tenantUser.actions.create, locale)}
          </Button>
        </div>

        {list.error ? (
          <ListErrorBanner message={list.error} onRetry={() => void list.reload()} />
        ) : null}

        {list.loading && list.items.length === 0 ? (
          <ListLoadingSkeleton rows={6} columns={4} showToolbar={false} />
        ) : null}

        {showEmpty ? <TenantUserEmptyState locale={locale} /> : null}

        {showTable ? (
          <TenantUserTable
            rows={list.items}
            locale={locale}
            loading={list.loading}
            disabled={list.loading}
            onDisable={(row) => setDisableTarget(row)}
            onEnable={handleEnable}
            onResetPassword={(row) => setResetTarget(row)}
          />
        ) : null}
      </div>

      <TenantUserCreateDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={() => void list.reload()} />

      <Dialog open={!!disableTarget} onOpenChange={(o) => !o && setDisableTarget(null)}>
        <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{pickLocalized(d.disableTitle, locale)}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {pickLocalized(d.disableBody, locale)}
          </p>
          {disableTarget ? <p className="text-sm font-medium">{disableTarget.username}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDisableTarget(null)}>
              {pickLocalized(messages.common.cancel, locale)}
            </Button>
            <Button type="button" variant="destructive" disabled={disabling} onClick={() => void confirmDisable()}>
              {pickLocalized(messages.tenantUser.actions.disable, locale)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TenantUserResetPasswordDialog
        user={resetTarget}
        open={!!resetTarget}
        onOpenChange={(open) => {
          if (!open) setResetTarget(null);
        }}
        onReset={() => void list.reload()}
      />
    </AppShellLayout>
  );
}
