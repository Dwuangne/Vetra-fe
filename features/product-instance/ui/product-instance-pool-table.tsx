"use client";

import type { ProductInstanceDto } from "@/lib/api/types/product-instance";
import { messages, pickLocalized } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import type { ProductInstanceStatus } from "@/lib/api/types/product-instance";
import { normalizeProductInstanceStatus } from "@/lib/production/product-instance-status";

type ProductInstancePoolTableProps = {
  rows: ProductInstanceDto[];
  locale: Locale;
  loading?: boolean;
};

function formatDateTime(value: string | null, locale: Locale): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(locale === "vi" ? "vi-VN" : "en-US", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function instanceStatusLabel(status: ProductInstanceStatus, locale: Locale): string {
  const labels = messages.productInstance.pool.instanceStatus;
  switch (status) {
    case 1:
      return pickLocalized(labels.committed, locale);
    case 2:
      return pickLocalized(labels.rejected, locale);
    default:
      return pickLocalized(labels.pending, locale);
  }
}

export function ProductInstancePoolTable({ rows, locale, loading }: ProductInstancePoolTableProps) {
  const f = messages.productInstance.fields;
  const pool = messages.productInstance.pool.fields;

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-max min-w-full border-collapse text-sm whitespace-nowrap">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="p-3 text-left font-medium">{pickLocalized(f.serialNumber, locale)}</th>
            <th className="p-3 text-left font-medium">{pickLocalized(f.epcUri, locale)}</th>
            <th className="p-3 text-left font-medium">{pickLocalized(pool.instanceStatus, locale)}</th>
            <th className="p-3 text-left font-medium">{pickLocalized(pool.exportedAt, locale)}</th>
          </tr>
        </thead>
        <tbody className={(loading ?? false) ? "opacity-60" : undefined}>
          {rows.map((row) => {
            const status = normalizeProductInstanceStatus(row.instanceStatus);
            return (
              <tr key={row.instanceId} className="border-b last:border-b-0">
                <td className="max-w-[14rem] truncate p-3 font-mono text-xs">{row.serialNumber}</td>
                <td className="max-w-[20rem] truncate p-3 font-mono text-xs text-muted-foreground">
                  {row.epcUri}
                </td>
                <td className="p-3 text-xs">{instanceStatusLabel(status, locale)}</td>
                <td className="p-3 text-xs text-muted-foreground">{formatDateTime(row.exportedAt, locale)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
