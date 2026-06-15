"use client";

import { Layers, Layers2, ScrollText } from "lucide-react";

import { ListRowIconLink } from "@/components/list/list-row-icon-link";
import { ListStatusBadge } from "@/components/list/list-status-badge";
import { StatusTransitionMenu } from "@/components/list/status-transition-menu";
import type { ProductionOrderStatus } from "@/lib/api/types/production-order";
import { messages, pickLocalized } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import { normalizeProductionOrderStatus } from "@/lib/production/production-order-status";

import type { ProductionOrderListRowVm } from "../model/production-order.types";

type ProductionOrderTableProps = {
  rows: ProductionOrderListRowVm[];
  locale: Locale;
  productNameById?: Record<string, string>;
  loading?: boolean;
  disabled?: boolean;
  resolveNextStatuses: (status: ProductionOrderStatus) => ProductionOrderStatus[];
  onTransition?: (row: ProductionOrderListRowVm, nextStatus: ProductionOrderStatus) => void;
};

function formatNumber(value: number | null): string {
  if (value === null) return "—";
  return new Intl.NumberFormat().format(value);
}

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

export function ProductionOrderTable({
  rows,
  locale,
  productNameById,
  loading,
  disabled,
  resolveNextStatuses,
  onTransition,
}: ProductionOrderTableProps) {
  const f = messages.productionOrder.fields;
  const actions = messages.productionOrder.actions;

  const statusLabel = (status: unknown) => {
    const normalizedStatus = normalizeProductionOrderStatus(status);
    const localizedRow = messages.productionOrder.status[normalizedStatus];
    return localizedRow ? pickLocalized(localizedRow, locale) : String(status ?? normalizedStatus);
  };

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-max min-w-full border-collapse text-sm whitespace-nowrap">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="p-3 text-left font-medium">{pickLocalized(f.orderNumber, locale)}</th>
            <th className="p-3 text-left font-medium">{pickLocalized(f.productId, locale)}</th>
            <th className="p-3 text-left font-medium">{pickLocalized(f.plannedQuantity, locale)}</th>
            <th className="p-3 text-left font-medium">{pickLocalized(f.actualQuantity, locale)}</th>
            <th className="p-3 text-left font-medium">{pickLocalized(f.plannedStartTime, locale)}</th>
            <th className="p-3 text-left font-medium">{pickLocalized(f.plannedEndTime, locale)}</th>
            <th className="p-3 text-left font-medium">{pickLocalized(f.status, locale)}</th>
            <th className="w-64 p-3 text-right font-medium">
              <span className="sr-only">{pickLocalized(actions.transitionStatus, locale)}</span>
            </th>
          </tr>
        </thead>
        <tbody className={(loading ?? false) ? "opacity-60" : undefined}>
          {rows.map((row) => {
            const currentStatus = normalizeProductionOrderStatus(row.status);
            const nextStatuses = resolveNextStatuses(currentStatus) ?? [];

            return (
              <tr key={row.productionOrderId} className="border-b last:border-b-0">
                <td className="max-w-[12rem] truncate p-3 font-mono text-xs">{row.orderNumber}</td>
                <td className="max-w-[12rem] truncate p-3 text-muted-foreground">
                  {productNameById?.[row.productId] ?? row.productId}
                </td>
                <td className="p-3">{formatNumber(row.plannedQuantity)}</td>
                <td className="p-3">{formatNumber(row.actualQuantity)}</td>
                <td className="max-w-[12rem] truncate p-3">{formatDateTime(row.plannedStartTime)}</td>
                <td className="max-w-[12rem] truncate p-3">{formatDateTime(row.plannedEndTime)}</td>
                <td className="p-3">
                  <ListStatusBadge status={currentStatus} label={statusLabel(currentStatus)} />
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <ListRowIconLink
                      href={`/events?productionOrderId=${encodeURIComponent(row.productionOrderId)}`}
                      label={pickLocalized(actions.viewProductionLog, locale)}
                      icon={ScrollText}
                    />
                    <ListRowIconLink
                      href={`/batches?productionOrderId=${encodeURIComponent(row.productionOrderId)}`}
                      label={pickLocalized(actions.viewBatches, locale)}
                      icon={Layers2}
                    />
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
