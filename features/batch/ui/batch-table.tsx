"use client";

import Link from "next/link";

import { ListStatusBadge } from "@/components/list/list-status-badge";
import { StatusTransitionMenu } from "@/components/list/status-transition-menu";
import { Button } from "@/components/ui/button";
import type { BatchStatus } from "@/lib/api/types/batch";
import { messages, pickLocalized } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import { normalizeBatchStatus } from "@/lib/production/batch-status";

import type { BatchListRowVm } from "../model/batch.types";

type BatchTableProps = {
  rows: BatchListRowVm[];
  locale: Locale;
  productNameById?: Record<string, string>;
  orderNumberById?: Record<string, string>;
  loading?: boolean;
  disabled?: boolean;
  resolveNextStatuses: (status: BatchStatus) => BatchStatus[];
  onTransition?: (row: BatchListRowVm, nextStatus: BatchStatus) => void;
};

function formatNumber(value: number | null): string {
  if (value === null) return "—";
  return new Intl.NumberFormat().format(value);
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  return value;
}

export function BatchTable({
  rows,
  locale,
  productNameById,
  orderNumberById,
  loading,
  disabled,
  resolveNextStatuses,
  onTransition,
}: BatchTableProps) {
  const f = messages.batch.fields;
  const actions = messages.batch.actions;

  const statusLabel = (status: unknown) => {
    const normalizedStatus = normalizeBatchStatus(status);
    const localizedRow = messages.batch.status[normalizedStatus];
    return localizedRow ? pickLocalized(localizedRow, locale) : String(status ?? normalizedStatus);
  };

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-max min-w-full border-collapse text-sm whitespace-nowrap">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="p-3 text-left font-medium">{pickLocalized(f.lotNumber, locale)}</th>
            <th className="p-3 text-left font-medium">{pickLocalized(f.productId, locale)}</th>
            <th className="p-3 text-left font-medium">{pickLocalized(f.productionOrderId, locale)}</th>
            <th className="p-3 text-left font-medium">{pickLocalized(f.plannedQuantity, locale)}</th>
            <th className="p-3 text-left font-medium">{pickLocalized(f.releasedQuantity, locale)}</th>
            <th className="p-3 text-left font-medium">{pickLocalized(f.productionDate, locale)}</th>
            <th className="p-3 text-left font-medium">{pickLocalized(f.status, locale)}</th>
            <th className="w-56 p-3 text-right font-medium">
              <span className="sr-only">{pickLocalized(actions.transitionStatus, locale)}</span>
            </th>
          </tr>
        </thead>
        <tbody className={(loading ?? false) ? "opacity-60" : undefined}>
          {rows.map((row) => {
            const currentStatus = normalizeBatchStatus(row.status);
            const nextStatuses = resolveNextStatuses(currentStatus) ?? [];

            return (
              <tr key={row.batchId} className="border-b last:border-b-0">
                <td className="max-w-[12rem] truncate p-3 font-mono text-xs">{row.lotNumber}</td>
                <td className="max-w-[12rem] truncate p-3 text-muted-foreground">
                  {productNameById?.[row.productId] ?? row.productId}
                </td>
                <td className="max-w-[12rem] truncate p-3 text-muted-foreground">
                  {row.productionOrderId ? (orderNumberById?.[row.productionOrderId] ?? row.productionOrderId) : "—"}
                </td>
                <td className="p-3">{formatNumber(row.plannedQuantity)}</td>
                <td className="p-3">{formatNumber(row.releasedQuantity)}</td>
                <td className="p-3">{formatDate(row.productionDate)}</td>
                <td className="p-3">
                  <ListStatusBadge status={currentStatus} label={statusLabel(currentStatus)} />
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" size="sm" asChild>
                      <Link href={`/product-instances?batchId=${encodeURIComponent(row.batchId)}`}>
                        {pickLocalized(actions.viewInstances, locale)}
                      </Link>
                    </Button>
                    {onTransition ? (
                      <StatusTransitionMenu
                        currentStatus={currentStatus}
                        nextStatuses={nextStatuses}
                        onTransition={(nextStatus) => onTransition(row, nextStatus)}
                        disabled={disabled}
                        labelResolver={statusLabel}
                        triggerText={pickLocalized(actions.transitionStatus, locale)}
                      />
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
