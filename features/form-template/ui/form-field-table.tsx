"use client";

import { ListRowActionsMenu } from "@/components/list/list-row-actions-menu";
import type { FormFieldDto } from "@/lib/api/types/form-template";
import { messages, pickLocalized } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import { getAttributeDataTypeLabel } from "@/lib/production/attribute-data-types";
import { cn } from "@/lib/utils";

type FormFieldTableProps = {
  rows: FormFieldDto[];
  locale: Locale;
  loading?: boolean;
  disabled?: boolean;
  onRemove?: (row: FormFieldDto) => void;
};

export function FormFieldTable({ rows, locale, loading, disabled, onRemove }: FormFieldTableProps) {
  const f = messages.formField.fields;
  const attributeName = pickLocalized(f.attributeName, locale);
  const dataType = pickLocalized(f.dataType, locale);
  const isRequired = pickLocalized(f.isRequired, locale);
  const removeLabel = pickLocalized(messages.formField.actions.remove, locale);
  const requiredYes = pickLocalized(messages.formField.requiredYes, locale);
  const requiredNo = pickLocalized(messages.formField.requiredNo, locale);
  const rowActionsLabel = pickLocalized(messages.common.rowActionsLabel, locale);

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-max min-w-full border-collapse text-sm whitespace-nowrap">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="p-3 text-left font-medium">{attributeName}</th>
            <th className="p-3 text-left font-medium">{dataType}</th>
            <th className="p-3 text-left font-medium">{isRequired}</th>
            <th className="w-14 p-3 text-right font-medium">
              <span className="sr-only">{rowActionsLabel}</span>
            </th>
          </tr>
        </thead>
        <tbody className={(loading ?? false) ? "opacity-60" : undefined}>
          {rows.map((row) => (
            <tr key={row.attrId} className="border-b last:border-b-0">
              <td className="max-w-[20rem] truncate p-3">{row.attributeName}</td>
              <td className="p-3">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border border-muted bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                  )}
                >
                  {getAttributeDataTypeLabel(row.dataType, locale)}
                </span>
              </td>
              <td className="p-3">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                    row.isRequired
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-muted bg-muted text-muted-foreground"
                  )}
                >
                  {row.isRequired ? requiredYes : requiredNo}
                </span>
              </td>
              <td className="p-3 text-right">
                <ListRowActionsMenu
                  actionsLabel={rowActionsLabel}
                  disabled={disabled}
                  items={
                    onRemove
                      ? [{ key: "remove", label: removeLabel, onSelect: () => onRemove(row), destructive: true }]
                      : []
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
