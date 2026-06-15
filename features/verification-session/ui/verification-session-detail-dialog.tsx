"use client";

import { useCallback, useEffect, useState } from "react";

import { ListLoadingSkeleton } from "@/components/list/list-loading-skeleton";
import { ListPagination } from "@/components/list/list-pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  cancelVerificationSession,
  getVerificationSessionById,
  listVerificationSessionAttachLines,
} from "@/lib/api/services/verification-session.service";
import type { VerificationAttachLineDto, VerificationSessionSummaryDto } from "@/lib/api/types/verification-session";
import { messages, pickLocalized, translateCommon, useLocale } from "@/lib/i18n";
import {
  isVerificationSessionOpen,
  normalizeVerificationSessionStatus,
  type VerificationSessionStatusLabel,
} from "@/lib/production/verification-session-status";
import {
  normalizeVerificationAttachOutcome,
  type VerificationAttachOutcomeLabel,
} from "@/lib/production/verification-attach-outcome";
import { BRAND_PRIMARY_BUTTON_CLASS } from "@/lib/ui/brand";
import { toastApiError, toastMutationSuccess } from "@/lib/ui/api-toast";

const ATTACH_PAGE_SIZE = 20;

type VerificationSessionDetailDialogProps = {
  sessionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canCancel: boolean;
  batchLabel?: string;
  productLabel?: string;
  onSessionUpdated: () => void;
};

function statusMessageKey(status: VerificationSessionStatusLabel): "open" | "cancelled" | "completed" {
  if (status === "Cancelled") return "cancelled";
  if (status === "Completed") return "completed";
  return "open";
}

function outcomeMessageKey(
  outcome: VerificationAttachOutcomeLabel
): keyof typeof messages.verificationSession.outcome {
  switch (outcome) {
    case "Committed":
      return "committed";
    case "Rejected":
      return "rejected";
    case "InvalidClientStatus":
      return "invalidClientStatus";
    case "InstanceNotFound":
      return "instanceNotFound";
    case "AlreadyCommitted":
      return "alreadyCommitted";
    default:
      return "skipped";
  }
}

const OUTCOME_FILTER_VALUES = ["0", "1", "2", "3", "4", "5"] as const;

function formatDateTime(iso: string, locale: "en" | "vi"): string {
  try {
    return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function VerificationSessionDetailDialog({
  sessionId,
  open,
  onOpenChange,
  canCancel,
  batchLabel,
  productLabel,
  onSessionUpdated,
}: VerificationSessionDetailDialogProps) {
  const { locale } = useLocale();
  const m = messages.verificationSession;
  const logFilters = m.attachLogFilters;

  const [loadingSession, setLoadingSession] = useState(false);
  const [loadingLines, setLoadingLines] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [session, setSession] = useState<VerificationSessionSummaryDto | null>(null);
  const [totalAttachLines, setTotalAttachLines] = useState(0);
  const [attachLines, setAttachLines] = useState<VerificationAttachLineDto[]>([]);
  const [attachPage, setAttachPage] = useState(1);
  const [attachTotalPages, setAttachTotalPages] = useState(1);
  const [outcomeFilter, setOutcomeFilter] = useState("");
  const [clientStatusFilter, setClientStatusFilter] = useState("");
  const [codeKeyword, setCodeKeyword] = useState("");
  const [hasSearchedLog, setHasSearchedLog] = useState(false);

  const loadSession = useCallback(async () => {
    if (!sessionId) return;
    setLoadingSession(true);
    try {
      const res = await getVerificationSessionById(sessionId);
      setSession(res.data?.session ?? null);
      setTotalAttachLines(res.data?.attachStats?.totalAttachLines ?? 0);
    } catch (e) {
      toastApiError(e, locale);
      setSession(null);
      setTotalAttachLines(0);
    } finally {
      setLoadingSession(false);
    }
  }, [sessionId, locale]);

  const loadAttachLines = useCallback(
    async (page: number) => {
      if (!sessionId) return;
      setLoadingLines(true);
      try {
        const res = await listVerificationSessionAttachLines(sessionId, {
          page,
          size: ATTACH_PAGE_SIZE,
          outcome: outcomeFilter === "" ? undefined : Number(outcomeFilter),
          clientStatus: clientStatusFilter.trim() || undefined,
          keyword: codeKeyword.trim() || undefined,
        });
        setAttachLines(res.data?.items ?? []);
        setAttachPage(res.data?.page ?? page);
        setAttachTotalPages(Math.max(1, res.data?.totalPages ?? 1));
      } catch (e) {
        toastApiError(e, locale);
        setAttachLines([]);
        setAttachTotalPages(1);
      } finally {
        setLoadingLines(false);
      }
    },
    [sessionId, locale, outcomeFilter, clientStatusFilter, codeKeyword]
  );

  useEffect(() => {
    if (!open || !sessionId) return;
    setAttachPage(1);
    setOutcomeFilter("");
    setClientStatusFilter("");
    setCodeKeyword("");
    setHasSearchedLog(false);
    setAttachLines([]);
    setAttachTotalPages(1);
  }, [open, sessionId]);

  useEffect(() => {
    if (!open || !sessionId) return;
    void loadSession();
  }, [open, sessionId, loadSession]);

  const onApplyLogFilters = () => {
    setHasSearchedLog(true);
    setAttachPage(1);
    void loadAttachLines(1);
  };

  const goAttachPage = (page: number) => {
    setAttachPage(page);
    void loadAttachLines(page);
  };

  const onClearLogFilters = async () => {
    setOutcomeFilter("");
    setClientStatusFilter("");
    setCodeKeyword("");
    setAttachPage(1);
    setHasSearchedLog(true);
    if (!sessionId) return;
    setLoadingLines(true);
    try {
      const res = await listVerificationSessionAttachLines(sessionId, {
        page: 1,
        size: ATTACH_PAGE_SIZE,
      });
      setAttachLines(res.data?.items ?? []);
      setAttachTotalPages(Math.max(1, res.data?.totalPages ?? 1));
    } catch (e) {
      toastApiError(e, locale);
      setAttachLines([]);
      setAttachTotalPages(1);
    } finally {
      setLoadingLines(false);
    }
  };

  const onConfirmCancelSession = async () => {
    if (!sessionId) return;

    setCancelling(true);
    try {
      const res = await cancelVerificationSession(sessionId);
      if (res.data) setSession(res.data);
      toastMutationSuccess(locale);
      setCancelConfirmOpen(false);
      onSessionUpdated();
    } catch (e) {
      toastApiError(e, locale);
    } finally {
      setCancelling(false);
    }
  };

  const statusLabel = session ? normalizeVerificationSessionStatus(session.status) : "Open";
  const statusKey = statusMessageKey(statusLabel);
  const showCancel = canCancel && session && isVerificationSessionOpen(session.status);
  const loading = loadingSession || loadingLines;
  const hasLogFilters = outcomeFilter !== "" || clientStatusFilter.trim() !== "" || codeKeyword.trim() !== "";
  const totalLinesLabel = pickLocalized(m.detailDialog.totalLines, locale).replace(
    "{count}",
    String(totalAttachLines)
  );

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{pickLocalized(m.detailDialog.title, locale)}</DialogTitle>
        </DialogHeader>

        {loadingSession ? <ListLoadingSkeleton rows={4} columns={3} /> : null}

        {!loadingSession && session ? (
          <div className="flex flex-col gap-4 py-2">
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">{pickLocalized(m.fields.status, locale)}</dt>
                <dd>{pickLocalized(m.status[statusKey], locale)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{pickLocalized(m.fields.openedAt, locale)}</dt>
                <dd>{formatDateTime(session.openedAt, locale)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{pickLocalized(m.fields.batch, locale)}</dt>
                <dd>{batchLabel ?? session.batchId}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{pickLocalized(m.fields.product, locale)}</dt>
                <dd>{productLabel ?? session.productId}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">{pickLocalized(m.fields.sessionId, locale)}</dt>
                <dd className="font-mono text-xs">{session.sessionId}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">{pickLocalized(m.fields.totalAttachLines, locale)}</dt>
                <dd>{totalLinesLabel}</dd>
              </div>
            </dl>

            <div className="flex flex-wrap items-end justify-between gap-2">
              <h3 className="text-sm font-medium">{pickLocalized(m.actions.viewLog, locale)}</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  void loadSession();
                  if (hasSearchedLog) void loadAttachLines(attachPage);
                }}
                disabled={loading}
              >
                {pickLocalized(m.actions.refreshLog, locale)}
              </Button>
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <div className="flex min-w-[140px] flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  {pickLocalized(logFilters.outcome, locale)}
                </label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                  value={outcomeFilter}
                  onChange={(e) => setOutcomeFilter(e.target.value)}
                  disabled={loadingLines}
                >
                  <option value="">{pickLocalized(logFilters.allOutcomes, locale)}</option>
                  {OUTCOME_FILTER_VALUES.map((value) => {
                    const label = normalizeVerificationAttachOutcome(Number(value));
                    const key = outcomeMessageKey(label);
                    return (
                      <option key={value} value={value}>
                        {pickLocalized(m.outcome[key], locale)}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="flex min-w-[140px] flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  {pickLocalized(logFilters.clientStatus, locale)}
                </label>
                <Input
                  value={clientStatusFilter}
                  onChange={(e) => setClientStatusFilter(e.target.value)}
                  placeholder={pickLocalized(logFilters.clientStatusPlaceholder, locale)}
                  disabled={loadingLines}
                />
              </div>
              <div className="flex min-w-[160px] flex-1 flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  {pickLocalized(logFilters.codeKeyword, locale)}
                </label>
                <Input
                  value={codeKeyword}
                  onChange={(e) => setCodeKeyword(e.target.value)}
                  placeholder={pickLocalized(logFilters.codeKeywordPlaceholder, locale)}
                  disabled={loadingLines}
                />
              </div>
              <Button
                type="button"
                size="sm"
                className={BRAND_PRIMARY_BUTTON_CLASS}
                onClick={onApplyLogFilters}
                disabled={loadingLines}
              >
                {pickLocalized(messages.productInstance.actions.search, locale)}
              </Button>
              {hasLogFilters ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClearLogFilters}
                  disabled={loadingLines}
                >
                  {pickLocalized(m.actions.clearFilters, locale)}
                </Button>
              ) : null}
            </div>

            {!hasSearchedLog ? (
              <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                {translateCommon("searchPrompt", locale)}
              </div>
            ) : null}

            {hasSearchedLog && loadingLines ? <ListLoadingSkeleton rows={3} columns={4} /> : null}

            {hasSearchedLog && !loadingLines && attachLines.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {pickLocalized(
                  hasLogFilters ? m.detailDialog.emptyLogFiltered : m.detailDialog.emptyLog,
                  locale
                )}
              </p>
            ) : null}

            {hasSearchedLog && !loadingLines && attachLines.length > 0 ? (
              <div className="overflow-hidden rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50 text-left">
                        <th className="px-3 py-2 font-medium">{pickLocalized(m.fields.attachTime, locale)}</th>
                        <th className="px-3 py-2 font-medium">{pickLocalized(m.fields.code, locale)}</th>
                        <th className="px-3 py-2 font-medium">{pickLocalized(m.fields.clientStatus, locale)}</th>
                        <th className="px-3 py-2 font-medium">{pickLocalized(m.fields.outcome, locale)}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attachLines.map((line) => {
                        const outcomeLabel = normalizeVerificationAttachOutcome(line.outcome);
                        const outcomeKey = outcomeMessageKey(outcomeLabel);
                        return (
                          <tr key={line.attachLineId} className="border-b last:border-0">
                            <td className="px-3 py-2 text-muted-foreground">
                              {formatDateTime(line.createdAt, locale)}
                            </td>
                            <td className="max-w-[240px] truncate px-3 py-2 font-mono text-xs" title={line.code}>
                              {line.code}
                            </td>
                            <td className="px-3 py-2">{line.clientStatus}</td>
                            <td className="px-3 py-2">{pickLocalized(m.outcome[outcomeKey], locale)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <ListPagination
                  page={attachPage}
                  totalPages={attachTotalPages}
                  loading={loadingLines}
                  onPrev={() => goAttachPage(Math.max(1, attachPage - 1))}
                  onNext={() => goAttachPage(Math.min(attachTotalPages, attachPage + 1))}
                />
              </div>
            ) : null}
          </div>
        ) : null}

        <DialogFooter className="gap-2 sm:gap-0">
          {showCancel ? (
            <Button
              type="button"
              variant="destructive"
              disabled={cancelling}
              onClick={() => setCancelConfirmOpen(true)}
            >
              {pickLocalized(m.actions.cancelSession, locale)}
            </Button>
          ) : null}
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {pickLocalized(m.actions.done, locale)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog open={cancelConfirmOpen} onOpenChange={setCancelConfirmOpen}>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{pickLocalized(m.detailDialog.cancelConfirmTitle, locale)}</DialogTitle>
          <DialogDescription>{pickLocalized(m.detailDialog.cancelConfirm, locale)}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            disabled={cancelling}
            onClick={() => setCancelConfirmOpen(false)}
          >
            {pickLocalized(messages.common.cancel, locale)}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={cancelling}
            onClick={() => void onConfirmCancelSession()}
          >
            {pickLocalized(m.detailDialog.confirmCancelButton, locale)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
