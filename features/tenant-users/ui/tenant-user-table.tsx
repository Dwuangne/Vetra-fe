"use client";

import { ListRowActionsMenu } from "@/components/list/list-row-actions-menu";
import type { TenantUserSummaryDto } from "@/lib/api/types/tenant-user";
import { messages, pickLocalized } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

import { tenantUserRoleLabel } from "./tenant-user-role-label";

type TenantUserTableProps = {
  rows: TenantUserSummaryDto[];
  locale: Locale;
  loading?: boolean;
  disabled?: boolean;
  onDisable: (row: TenantUserSummaryDto) => void;
  onEnable: (row: TenantUserSummaryDto) => void;
  onResetPassword: (row: TenantUserSummaryDto) => void;
};

export function TenantUserTable({
  rows,
  locale,
  loading,
  disabled,
  onDisable,
  onEnable,
  onResetPassword,
}: TenantUserTableProps) {
  const f = messages.tenantUser.fields;
  const a = messages.tenantUser.actions;
  const s = messages.tenantUser.status;
  const rowActionsLabel = pickLocalized(messages.common.rowActionsLabel, locale);
  const disableLabel = pickLocalized(a.disable, locale);
  const enableLabel = pickLocalized(a.enable, locale);
  const resetPasswordLabel = pickLocalized(a.resetPassword, locale);

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-max min-w-full border-collapse text-sm whitespace-nowrap">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="p-3 text-left font-medium">{pickLocalized(f.username, locale)}</th>
            <th className="p-3 text-left font-medium">{pickLocalized(f.role, locale)}</th>
            <th className="p-3 text-left font-medium">{pickLocalized(f.status, locale)}</th>
            <th className="w-14 p-3 text-right font-medium">
              <span className="sr-only">{rowActionsLabel}</span>
            </th>
          </tr>
        </thead>
        <tbody className={cn((loading ?? false) && "opacity-60")}>
          {rows.map((row) => (
            <tr key={row.userId} className="border-b last:border-b-0">
              <td className="max-w-[14rem] truncate p-3">{row.username}</td>
              <td className="p-3">
                <span className="inline-flex rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs font-medium">
                  {tenantUserRoleLabel(row.role, locale)}
                </span>
              </td>
              <td className="p-3">
                <span
                  className={cn(
                    "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
                    row.isDisabled
                      ? "border border-destructive/40 bg-destructive/10 text-destructive"
                      : "border border-emerald-700/30 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-100"
                  )}
                >
                  {row.isDisabled ? pickLocalized(s.locked, locale) : pickLocalized(s.active, locale)}
                </span>
              </td>
              <td className="p-3 text-right">
                <ListRowActionsMenu
                  actionsLabel={rowActionsLabel}
                  disabled={disabled}
                  items={[
                    !row.isDisabled
                      ? { key: "disable", label: disableLabel, onSelect: () => onDisable(row) }
                      : { key: "enable", label: enableLabel, onSelect: () => onEnable(row) },
                    { key: "reset", label: resetPasswordLabel, onSelect: () => onResetPassword(row) },
                  ]}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
