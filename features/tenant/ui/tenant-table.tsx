"use client";

import type { TenantListRowVm } from "../model/tenant.types";
import { Button } from "@/components/ui/button";
import { messages, pickLocalized } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import { BRAND_PRIMARY_BUTTON_CLASS } from "@/lib/ui/brand";

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
  const tenantIdLabel =
    locale === "vi" ? "ID" : "ID";
  const actions = messages.tenant.actions;

  return (
    <div className="overflow-hidden rounded-md border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="p-3 text-left font-medium">{tenantIdLabel}</th>
            <th className="p-3 text-left font-medium">{name}</th>
            <th className="p-3 text-left font-medium">{gcp}</th>
            <th className="w-36 p-3 text-right font-medium">
              <span className="sr-only">{pickLocalized(actions.update, locale)}</span>
            </th>
          </tr>
        </thead>
        <tbody className={(loading ?? false) ? "opacity-60" : undefined}>
          {rows.map((row) => (
            <tr key={row.tenantId} className="border-b last:border-b-0">
              <td className="max-w-[12rem] truncate p-3 font-mono text-xs">{row.tenantId}</td>
              <td className="max-w-[14rem] truncate p-3">{row.name}</td>
              <td className="max-w-[12rem] truncate p-3 text-muted-foreground">{row.gcp ?? "—"}</td>
              <td className="flex flex-wrap justify-end gap-2 p-3">
                {onEdit ? (
                  <Button type="button" size="sm" className={BRAND_PRIMARY_BUTTON_CLASS} disabled={disabled} onClick={() => onEdit(row)}>
                    {pickLocalized(actions.update, locale)}
                  </Button>
                ) : null}
                {onDelete ? (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={disabled}
                    onClick={() => onDelete(row)}
                  >
                    {pickLocalized(actions.delete, locale)}
                  </Button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
