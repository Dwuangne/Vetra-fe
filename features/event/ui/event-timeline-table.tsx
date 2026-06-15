"use client";

import { Button } from "@/components/ui/button";
import type { EventTimelineItemResult } from "@/lib/api/types/event";
import { messages, pickLocalized } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import { getBizStepLabel } from "@/lib/production/cbv-biz-steps";

import { getPlantLotLabel } from "../lib/plant-lot-label";

type EventTimelineTableProps = {
  rows: EventTimelineItemResult[];
  locale: Locale;
  loading?: boolean;
  locationNameById: Record<string, string>;
  onViewDetail: (eventId: string) => void;
};

function formatDateTime(iso: string, locale: Locale): string {
  try {
    return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function EventTimelineTable({
  rows,
  locale,
  loading,
  locationNameById,
  onViewDetail,
}: EventTimelineTableProps) {
  const t = messages.event.table;
  const a = messages.event.actions;

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b bg-muted/50 text-left">
            <th className="px-4 py-3 font-medium">{pickLocalized(t.eventTime, locale)}</th>
            <th className="px-4 py-3 font-medium">{pickLocalized(t.bizStep, locale)}</th>
            <th className="px-4 py-3 font-medium">{pickLocalized(t.lot, locale)}</th>
            <th className="px-4 py-3 font-medium">{pickLocalized(t.readPoint, locale)}</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const readPointLabel = row.readPointId
              ? (locationNameById[row.readPointId] ?? row.readPointId)
              : "—";
            const lotLabel = getPlantLotLabel(row) ?? "—";

            return (
              <tr key={row.eventId} className="border-b last:border-0">
                <td className="px-4 py-3 text-muted-foreground">{formatDateTime(row.eventTime, locale)}</td>
                <td className="px-4 py-3">
                  {row.bizStep ? getBizStepLabel(row.bizStep, locale) : "—"}
                </td>
                <td className="px-4 py-3">{lotLabel}</td>
                <td className="px-4 py-3">{readPointLabel}</td>
                <td className="px-4 py-3 text-right">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    onClick={() => onViewDetail(row.eventId)}
                  >
                    {pickLocalized(a.viewDetail, locale)}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
