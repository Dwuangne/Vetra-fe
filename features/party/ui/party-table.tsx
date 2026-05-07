"use client";

import type { PartyListRowVm } from "../model/party.types";
import { Button } from "@/components/ui/button";
import { messages, pickLocalized } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import { BRAND_PRIMARY_BUTTON_CLASS } from "@/lib/ui/brand";

type PartyTableProps = {
  rows: PartyListRowVm[];
  locale: Locale;
  loading?: boolean;
  disabled?: boolean;
  onEdit?: (row: PartyListRowVm) => void;
  onDelete?: (row: PartyListRowVm) => void;
};

export function PartyTable({ rows, locale, loading, disabled, onEdit, onDelete }: PartyTableProps) {
  const f = messages.party.fields;
  const name = pickLocalized(f.name, locale);
  const gln = pickLocalized(f.gln, locale);
  const actions = messages.party.actions;

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-max min-w-full border-collapse text-sm whitespace-nowrap">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="p-3 text-left font-medium">{gln}</th>
            <th className="p-3 text-left font-medium">{name}</th>
            <th className="w-36 p-3 text-right font-medium">
              <span className="sr-only">{pickLocalized(actions.update, locale)}</span>
            </th>
          </tr>
        </thead>
        <tbody className={(loading ?? false) ? "opacity-60" : undefined}>
          {rows.map((row) => (
            <tr key={row.partyId} className="border-b last:border-b-0">
              <td className="max-w-[12rem] truncate p-3 font-mono text-xs">{row.gln}</td>
              <td className="p-3">{row.name}</td>
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
