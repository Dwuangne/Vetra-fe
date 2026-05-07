"use client";

import type { LocationListRowVm } from "../model/location.types";
import { Button } from "@/components/ui/button";
import { messages, pickLocalized } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import { BRAND_PRIMARY_BUTTON_CLASS } from "@/lib/ui/brand";

type LocationTableProps = {
  rows: LocationListRowVm[];
  locale: Locale;
  partyNameById?: Record<string, string>;
  loading?: boolean;
  disabled?: boolean;
  onEdit?: (row: LocationListRowVm) => void;
  onDelete?: (row: LocationListRowVm) => void;
};

export function LocationTable({
  rows,
  locale,
  partyNameById,
  loading,
  disabled,
  onEdit,
  onDelete,
}: LocationTableProps) {
  const f = messages.location.fields;
  const name = pickLocalized(f.name, locale);
  const gln = pickLocalized(f.gln, locale);
  const extension = pickLocalized(f.extension, locale);
  const address = pickLocalized(f.address, locale);
  const party = pickLocalized(f.partyId, locale);
  const actions = messages.location.actions;

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-max min-w-full border-collapse text-sm whitespace-nowrap">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="p-3 text-left font-medium">{gln}</th>
            <th className="p-3 text-left font-medium">{extension}</th>
            <th className="p-3 text-left font-medium">{name}</th>
            <th className="p-3 text-left font-medium">{address}</th>
            <th className="p-3 text-left font-medium">{party}</th>
            <th className="w-36 p-3 text-right font-medium">
              <span className="sr-only">{pickLocalized(actions.update, locale)}</span>
            </th>
          </tr>
        </thead>
        <tbody className={(loading ?? false) ? "opacity-60" : undefined}>
          {rows.map((row) => (
            <tr key={row.locationId} className="border-b last:border-b-0">
              <td className="max-w-[10rem] truncate p-3 font-mono text-xs">{row.gln}</td>
              <td className="max-w-[6rem] truncate p-3 font-mono text-xs">{row.extension}</td>
              <td className="max-w-[12rem] truncate p-3">{row.name}</td>
              <td className="max-w-[14rem] truncate p-3 text-muted-foreground" title={row.address ?? undefined}>
                {row.address?.trim() ? row.address : "—"}
              </td>
              <td className="max-w-[10rem] truncate p-3 text-muted-foreground">
                {row.partyId ? (partyNameById?.[row.partyId] ?? row.partyId) : "—"}
              </td>
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
