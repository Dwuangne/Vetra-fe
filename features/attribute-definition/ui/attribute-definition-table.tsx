"use client";

import { ListRowActionsMenu } from "@/components/list/list-row-actions-menu";
import type { AttributeDefinitionDto } from "@/lib/api/types/attribute-definition";
import { messages, pickLocalized } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import { getAttributeDataTypeLabel } from "@/lib/production/attribute-data-types";
import { cn } from "@/lib/utils";

type AttributeDefinitionTableProps = {
  rows: AttributeDefinitionDto[];
  locale: Locale;
  loading?: boolean;
  disabled?: boolean;
  onEdit?: (row: AttributeDefinitionDto) => void;
  onDelete?: (row: AttributeDefinitionDto) => void;
};

export function AttributeDefinitionTable({
  rows,
  locale,
  loading,
  disabled,
  onEdit,
  onDelete,
}: AttributeDefinitionTableProps) {
  const f = messages.attributeDefinition.fields;
  const name = pickLocalized(f.name, locale);
  const dataType = pickLocalized(f.dataType, locale);
  const actions = messages.attributeDefinition.actions;
  const rowActionsLabel = pickLocalized(messages.common.rowActionsLabel, locale);
  const updateLabel = pickLocalized(actions.update, locale);
  const deleteLabel = pickLocalized(actions.delete, locale);

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-max min-w-full border-collapse text-sm whitespace-nowrap">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="p-3 text-left font-medium">{name}</th>
            <th className="p-3 text-left font-medium">{dataType}</th>
            <th className="w-14 p-3 text-right font-medium">
              <span className="sr-only">{rowActionsLabel}</span>
            </th>
          </tr>
        </thead>
        <tbody className={(loading ?? false) ? "opacity-60" : undefined}>
          {rows.map((row) => (
            <tr key={row.attrId} className="border-b last:border-b-0">
              <td className="max-w-[20rem] truncate p-3">{row.name}</td>
              <td className="p-3">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border border-muted bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                  )}
                >
                  {getAttributeDataTypeLabel(row.dataType, locale)}
                </span>
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
