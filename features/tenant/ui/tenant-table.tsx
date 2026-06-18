"use client";

import { ListRowActionsMenu } from "@/components/list/list-row-actions-menu";
import { messages, pickLocalized } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import type { TenantListRowVm } from "../model/tenant.types";

type TenantTableProps = {
  rows: TenantListRowVm[];
  locale: Locale;
  loading?: boolean;
  disabled?: boolean;
  onEdit?: (row: TenantListRowVm) => void;
  onDelete?: (row: TenantListRowVm) => void;
};

export function TenantTable({ rows, locale, loading, disabled, onEdit, onDelete }: TenantTableProps) {
  const f = messages.tenant.fields;
  const name = pickLocalized(f.name, locale);
  const gcp = pickLocalized(f.gcp, locale);
  const tenantIdLabel = locale === "vi" ? "ID" : "ID";
  const actions = messages.tenant.actions;
  const rowActionsLabel = pickLocalized(messages.common.rowActionsLabel, locale);
  const updateLabel = pickLocalized(actions.update, locale);
  const deleteLabel = pickLocalized(actions.delete, locale);

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-max min-w-full border-collapse text-sm whitespace-nowrap">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="p-3 text-left font-medium">{tenantIdLabel}</th>
            <th className="p-3 text-left font-medium">{name}</th>
            <th className="p-3 text-left font-medium">{gcp}</th>
            <th className="w-14 p-3 text-right font-medium">
              <span className="sr-only">{rowActionsLabel}</span>
            </th>
          </tr>
        </thead>
        <tbody className={(loading ?? false) ? "opacity-60" : undefined}>
          {rows.map((row) => (
            <tr key={row.tenantId} className="border-b last:border-b-0">
              <td className="max-w-[12rem] truncate p-3 font-mono text-xs">{row.tenantId}</td>
              <td className="max-w-[14rem] truncate p-3">{row.name}</td>
              <td className="max-w-[12rem] truncate p-3 text-muted-foreground">{row.gcp ?? "—"}</td>
              <td className="p-3 text-right">
                <ListRowActionsMenu
                  actionsLabel={rowActionsLabel}
                  disabled={disabled}
                  items={[
                    ...(onEdit ? [{ key: "edit", label: updateLabel, onSelect: () => onEdit(row) }] : []),
                    ...(onDelete
                      ? [{ key: "delete", label: deleteLabel, onSelect: () => onDelete(row), destructive: true }]
                      : []),
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
