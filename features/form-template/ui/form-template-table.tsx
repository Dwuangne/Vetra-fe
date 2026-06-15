"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { FormTemplateDto } from "@/lib/api/types/form-template";
import { messages, pickLocalized } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import { getBizStepLabel } from "@/lib/production/cbv-biz-steps";
import { BRAND_PRIMARY_BUTTON_CLASS } from "@/lib/ui/brand";

type FormTemplateTableProps = {
  rows: FormTemplateDto[];
  locale: Locale;
  loading?: boolean;
  disabled?: boolean;
  onEdit?: (row: FormTemplateDto) => void;
  onDelete?: (row: FormTemplateDto) => void;
};

export function FormTemplateTable({
  rows,
  locale,
  loading,
  disabled,
  onEdit,
  onDelete,
}: FormTemplateTableProps) {
  const f = messages.formTemplate.fields;
  const name = pickLocalized(f.name, locale);
  const bizStep = pickLocalized(f.bizStep, locale);
  const fieldCount = pickLocalized(f.fieldCount, locale);
  const actions = messages.formTemplate.actions;

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-max min-w-full border-collapse text-sm whitespace-nowrap">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="p-3 text-left font-medium">{name}</th>
            <th className="p-3 text-left font-medium">{bizStep}</th>
            <th className="p-3 text-left font-medium">{fieldCount}</th>
            <th className="w-48 p-3 text-right font-medium">
              <span className="sr-only">{pickLocalized(actions.manageFields, locale)}</span>
            </th>
          </tr>
        </thead>
        <tbody className={(loading ?? false) ? "opacity-60" : undefined}>
          {rows.map((row) => (
            <tr key={row.templateId} className="border-b last:border-b-0">
              <td className="max-w-[20rem] truncate p-3">{row.name}</td>
              <td className="max-w-[16rem] truncate p-3">{getBizStepLabel(row.bizStep, locale)}</td>
              <td className="p-3">{Array.isArray(row.fields) ? row.fields.length : "—"}</td>
              <td className="flex flex-wrap justify-end gap-2 p-3">
                <Button type="button" variant="outline" size="sm" disabled={disabled} asChild>
                  <Link href={`/form-templates/${encodeURIComponent(row.templateId)}/fields`}>
                    {pickLocalized(actions.manageFields, locale)}
                  </Link>
                </Button>
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
