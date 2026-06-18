"use client";

import { ListRowActionsMenu } from "@/components/list/list-row-actions-menu";
import { messages, pickLocalized } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import type { PartyListRowVm } from "../model/party.types";

type PartyTableProps = {
  rows: PartyListRowVm[];
  locale: Locale;
  loading?: boolean;
  disabled?: boolean;
  onEdit?: (row: PartyListRowVm) => void;
  onDelete?: (row: PartyListRowVm) => void;
};

function displayValue(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : "—";
}

export function PartyTable({ rows, locale, loading, disabled, onEdit, onDelete }: PartyTableProps) {
  const f = messages.party.fields;
  const name = pickLocalized(f.name, locale);
  const gln = pickLocalized(f.gln, locale);
  const taxCode = pickLocalized(f.taxCode, locale);
  const actions = messages.party.actions;
  const rowActionsLabel = pickLocalized(messages.common.rowActionsLabel, locale);
  const updateLabel = pickLocalized(actions.update, locale);
  const deleteLabel = pickLocalized(actions.delete, locale);

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-max min-w-full border-collapse text-sm whitespace-nowrap">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="p-3 text-left font-medium">{name}</th>
            <th className="p-3 text-left font-medium">{taxCode}</th>
            <th className="p-3 text-left font-medium">{gln}</th>
            <th className="w-14 p-3 text-right font-medium">
              <span className="sr-only">{rowActionsLabel}</span>
            </th>
          </tr>
        </thead>
        <tbody className={(loading ?? false) ? "opacity-60" : undefined}>
          {rows.map((row) => (
            <tr key={row.partyId} className="border-b last:border-b-0">
              <td className="max-w-[16rem] truncate p-3">{row.name}</td>
              <td className="max-w-[10rem] truncate p-3 font-mono text-xs">{displayValue(row.taxCode)}</td>
              <td className="max-w-[12rem] truncate p-3 font-mono text-xs">{displayValue(row.gln)}</td>
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
