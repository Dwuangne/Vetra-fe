"use client";

import { Button } from "@/components/ui/button";
import type { VerificationSessionSummaryDto } from "@/lib/api/types/verification-session";
import { messages, pickLocalized } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import {
  normalizeVerificationSessionStatus,
  type VerificationSessionStatusLabel,
} from "@/lib/production/verification-session-status";

type VerificationSessionTableProps = {
  rows: VerificationSessionSummaryDto[];
  locale: Locale;
  loading?: boolean;
  batchLabelById: Record<string, string>;
  productLabelById: Record<string, string>;
  onViewLog: (sessionId: string) => void;
};

function statusMessageKey(status: VerificationSessionStatusLabel): "open" | "cancelled" | "completed" {
  if (status === "Cancelled") return "cancelled";
  if (status === "Completed") return "completed";
  return "open";
}

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

export function VerificationSessionTable({
  rows,
  locale,
  loading,
  batchLabelById,
  productLabelById,
  onViewLog,
}: VerificationSessionTableProps) {
  const f = messages.verificationSession.fields;
  const a = messages.verificationSession.actions;
  const st = messages.verificationSession.status;

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b bg-muted/50 text-left">
            <th className="px-4 py-3 font-medium">{pickLocalized(f.openedAt, locale)}</th>
            <th className="px-4 py-3 font-medium">{pickLocalized(f.status, locale)}</th>
            <th className="px-4 py-3 font-medium">{pickLocalized(f.batch, locale)}</th>
            <th className="px-4 py-3 font-medium">{pickLocalized(f.product, locale)}</th>
            <th className="px-4 py-3 font-medium">{pickLocalized(f.sessionId, locale)}</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const statusLabel = normalizeVerificationSessionStatus(row.status);
            const statusKey = statusMessageKey(statusLabel);
            return (
              <tr key={row.sessionId} className="border-b last:border-0">
                <td className="px-4 py-3 text-muted-foreground">{formatDateTime(row.openedAt, locale)}</td>
                <td className="px-4 py-3">{pickLocalized(st[statusKey], locale)}</td>
                <td className="px-4 py-3">{batchLabelById[row.batchId] ?? row.batchId}</td>
                <td className="px-4 py-3">{productLabelById[row.productId] ?? row.productId}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{row.sessionId}</td>
                <td className="px-4 py-3 text-right">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    onClick={() => onViewLog(row.sessionId)}
                  >
                    {pickLocalized(a.viewLog, locale)}
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
