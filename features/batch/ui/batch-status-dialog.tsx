"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { BatchStatus } from "@/lib/api/types/batch";
import { messages, pickLocalized, useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type StatusDialogFormValues = {
  releasedQuantity: number;
};

type BatchStatusDialogProps = {
  open: boolean;
  currentStatus: BatchStatus;
  nextStatus: BatchStatus | null;
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (payload: { nextStatus: BatchStatus; releasedQuantity?: number | null }) => Promise<void> | void;
};

export function BatchStatusDialog({
  open,
  currentStatus,
  nextStatus,
  loading,
  onOpenChange,
  onConfirm,
}: BatchStatusDialogProps) {
  const { locale } = useLocale();
  const needsReleasedQuantity = nextStatus === "Released";
  const { register, handleSubmit, reset, formState } = useForm<StatusDialogFormValues>({
    defaultValues: { releasedQuantity: 1 },
  });

  useEffect(() => {
    if (!open) return;
    reset({ releasedQuantity: 1 });
  }, [open, reset, nextStatus]);

  const onSubmit = handleSubmit(async (values) => {
    if (!nextStatus) return;
    await onConfirm({
      nextStatus,
      releasedQuantity: needsReleasedQuantity ? values.releasedQuantity : null,
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{pickLocalized(messages.batch.actions.transitionStatus, locale)}</DialogTitle>
        </DialogHeader>

        {nextStatus ? (
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              {pickLocalized(messages.batch.fields.status, locale)}:{" "}
              <span className="font-medium">{pickLocalized(messages.batch.status[currentStatus], locale)}</span> {"->"}{" "}
              <span className="font-medium">{pickLocalized(messages.batch.status[nextStatus], locale)}</span>
            </p>
            {nextStatus === "Released" ? (
              <p className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-950">
                {pickLocalized(messages.production.batchDialog.publicScanReleasedHint, locale)}
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
                {pickLocalized(messages.batch.fields.releasedQuantity, locale)}
              </label>
              <Input
                id="batch-released-quantity"
                type="number"
                min={1}
                className={cn(formState.errors.releasedQuantity && "border-destructive")}
                {...register("releasedQuantity", {
                  valueAsNumber: true,
                  required: "Released quantity is required",
                  min: { value: 1, message: "Released quantity must be at least 1" },
                })}
              />
              {formState.errors.releasedQuantity?.message ? (
                <p className="text-sm text-destructive">{String(formState.errors.releasedQuantity.message)}</p>
              ) : null}
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !nextStatus}>
              {pickLocalized(messages.batch.actions.transitionStatus, locale)}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
