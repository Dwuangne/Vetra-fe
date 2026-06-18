"use client";

import { ListRowActionsMenu } from "@/components/list/list-row-actions-menu";
import { messages, pickLocalized } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import type { CertificateListRowVm } from "../model/certificate.types";

type CertificateTableProps = {
  rows: CertificateListRowVm[];
  locale: Locale;
  productNameById?: Record<string, string>;
  locationNameById?: Record<string, string>;
  loading?: boolean;
  disabled?: boolean;
  onEdit?: (row: CertificateListRowVm) => void;
  onDelete?: (row: CertificateListRowVm) => void;
};

export function CertificateTable({
  rows,
  locale,
  productNameById,
  locationNameById,
  loading,
  disabled,
  onEdit,
  onDelete,
}: CertificateTableProps) {
  const f = messages.certificate.fields;
  const product = pickLocalized(f.productId, locale);
  const location = pickLocalized(f.locationId, locale);
  const name = pickLocalized(f.name, locale);
  const url = pickLocalized(f.url, locale);
  const actions = messages.certificate.actions;
  const rowActionsLabel = pickLocalized(messages.common.rowActionsLabel, locale);
  const updateLabel = pickLocalized(actions.update, locale);
  const deleteLabel = pickLocalized(actions.delete, locale);

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-max min-w-full border-collapse text-sm whitespace-nowrap">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="p-3 text-left font-medium">{product}</th>
            <th className="p-3 text-left font-medium">{location}</th>
            <th className="p-3 text-left font-medium">{name}</th>
            <th className="p-3 text-left font-medium">{url}</th>
            <th className="w-14 p-3 text-right font-medium">
              <span className="sr-only">{rowActionsLabel}</span>
            </th>
          </tr>
        </thead>
        <tbody className={(loading ?? false) ? "opacity-60" : undefined}>
          {rows.map((row) => (
            <tr key={row.certificateId} className="border-b last:border-b-0">
              <td className="max-w-[14rem] truncate p-3">
                {row.productId ? (productNameById?.[row.productId] ?? row.productId) : "—"}
              </td>
              <td className="max-w-[14rem] truncate p-3">
                {row.locationId ? (locationNameById?.[row.locationId] ?? row.locationId) : "—"}
              </td>
              <td className="max-w-[12rem] truncate p-3">{row.name}</td>
              <td className="max-w-[20rem] truncate p-3 text-muted-foreground" title={row.url ?? undefined}>
                {row.url?.trim() ? row.url : "—"}
              </td>
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
