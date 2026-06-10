"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getBatchById } from "@/lib/api/services/batch.service";
import type { BatchStatus } from "@/lib/api/types/batch";
import { messages, pickLocalized, useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type StatusDialogFormValues = {
  releasedQuantity: number;
};

type BatchStatusDialogProps = {
  open: boolean;
  batchId: string | null;
  currentStatus: BatchStatus;
  nextStatus: BatchStatus | null;
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (payload: { nextStatus: BatchStatus; releasedQuantity?: number | null }) => Promise<void> | void;
};

export function BatchStatusDialog({
  open,
  batchId,
  currentStatus,
  nextStatus,
  loading,
  onOpenChange,
  onConfirm,
}: BatchStatusDialogProps) {
  const { locale } = useLocale();
  const needsReleasedQuantity = nextStatus === "Released";
  const [committedCount, setCommittedCount] = useState<number | null>(null);
  const [loadingContext, setLoadingContext] = useState(false);
  const lockedFromSync = needsReleasedQuantity && committedCount !== null && committedCount > 0;

  const { register, handleSubmit, reset, formState } = useForm<StatusDialogFormValues>({
    defaultValues: { releasedQuantity: 1 },
  });

  useEffect(() => {
    if (!open || !needsReleasedQuantity || !batchId) {
      setCommittedCount(null);
      setLoadingContext(false);
      if (!open) {
        reset({ releasedQuantity: 1 });
      }
      return;
    }

    let cancelled = false;
    setLoadingContext(true);
    void (async () => {
      try {
        const res = await getBatchById(batchId);
        if (cancelled) return;
        const count = res.data?.committedInstanceCount ?? 0;
        setCommittedCount(count);
        reset({ releasedQuantity: count > 0 ? count : 1 });
      } catch {
        if (!cancelled) {
          setCommittedCount(null);
          reset({ releasedQuantity: 1 });
        }
      } finally {
        if (!cancelled) setLoadingContext(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, needsReleasedQuantity, batchId, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (!nextStatus) return;
    await onConfirm({
      nextStatus,
      releasedQuantity: needsReleasedQuantity
        ? lockedFromSync
          ? committedCount!
          : values.releasedQuantity
        : null,
    });
  });

  const m = messages.batch;
  const dialog = m.statusTransitionDialog;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{pickLocalized(dialog.title, locale)}</DialogTitle>
          <DialogDescription>{pickLocalized(dialog.description, locale)}</DialogDescription>
        </DialogHeader>

        {nextStatus ? (
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              {pickLocalized(m.fields.status, locale)}:{" "}
              <span className="font-medium">{pickLocalized(m.status[currentStatus], locale)}</span> {"->"}{" "}
              <span className="font-medium">{pickLocalized(m.status[nextStatus], locale)}</span>
            </p>
            {nextStatus === "Released" ? (
              <p className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-950">
                {pickLocalized(
                  lockedFromSync ? dialog.releasedFromSyncHint : dialog.releasedManualHint,
                  locale
                )}
              </p>
            ) : null}
            {nextStatus === "Quarantined" || nextStatus === "Recalled" || nextStatus === "Destroyed" ? (
              <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
                {pickLocalized(messages.production.batchDialog.publicScanRestrictedHint, locale)}
              </p>
            ) : null}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="grid gap-4">
          {needsReleasedQuantity ? (
            <div className="grid gap-2">
              <label htmlFor="batch-released-quantity" className="text-sm font-medium">
                {pickLocalized(
                  lockedFromSync ? m.fields.committedInstanceCount : m.fields.releasedQuantity,
                  locale
                )}
              </label>
              {loadingContext ? (
                <p className="text-sm text-muted-foreground">{pickLocalized(messages.common.loading, locale)}</p>
              ) : (
                <Input
                  id="batch-released-quantity"
                  type="number"
                  min={1}
                  readOnly={lockedFromSync}
                  className={cn(
                    formState.errors.releasedQuantity && "border-destructive",
                    lockedFromSync && "bg-muted"
                  )}
                  {...register("releasedQuantity", {
                    valueAsNumber: true,
                    required: "Released quantity is required",
                    min: { value: 1, message: "Released quantity must be at least 1" },
                  })}
                />
              )}
              {formState.errors.releasedQuantity?.message ? (
                <p className="text-sm text-destructive">{String(formState.errors.releasedQuantity.message)}</p>
              ) : null}
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {pickLocalized(messages.common.cancel, locale)}
            </Button>
            <Button type="submit" disabled={loading || loadingContext || !nextStatus}>
              {pickLocalized(dialog.confirmButton, locale)}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
