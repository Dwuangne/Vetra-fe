"use client";

import type { ProductListRowVm } from "../model/product.types";
import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/ui/safe-image";
import { messages, pickLocalized } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import { BRAND_PRIMARY_BUTTON_CLASS } from "@/lib/ui/brand";

type ProductTableProps = {
  rows: ProductListRowVm[];
  locale: Locale;
  loading?: boolean;
  disabled?: boolean;
  onEdit?: (row: ProductListRowVm) => void;
  onDelete?: (row: ProductListRowVm) => void;
};

export function ProductTable({ rows, locale, loading, disabled, onEdit, onDelete }: ProductTableProps) {
  const f = messages.product.fields;
  const gtin = pickLocalized(f.gtin, locale);
  const desc = pickLocalized(f.description, locale);
  const actions = messages.product.actions;
  const toPlainText = (html: string | null) => (html ? html.replace(/<[^>]+>/g, "").trim() : "");

  return (
    <div className={(loading ?? false) ? "opacity-60" : undefined}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row) => (
          <article key={row.productId} className="overflow-hidden rounded-lg border bg-card">
            <div className="aspect-video w-full bg-muted/40">
              <SafeImage
                src={row.imageUrl}
                alt={row.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="space-y-2 p-4">
              <h3 className="line-clamp-1 font-medium">{row.name}</h3>
              <div className="flex flex-wrap justify-end gap-2 pt-1">
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
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
