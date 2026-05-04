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
import type { ProductionOrderStatus } from "@/lib/api/types/production-order";
import { messages, pickLocalized, useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type StatusDialogFormValues = {
  actualQuantity: number;
};

type ProductionOrderStatusDialogProps = {
  open: boolean;
  currentStatus: ProductionOrderStatus;
  nextStatus: ProductionOrderStatus | null;
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (payload: { nextStatus: ProductionOrderStatus; actualQuantity?: number | null }) => Promise<void> | void;
};

export function ProductionOrderStatusDialog({
  open,
  currentStatus,
  nextStatus,
  loading,
  onOpenChange,
  onConfirm,
}: ProductionOrderStatusDialogProps) {
  const { locale } = useLocale();
  const needsActualQuantity = nextStatus === "Completed";
  const { register, handleSubmit, reset, formState } = useForm<StatusDialogFormValues>({
    defaultValues: { actualQuantity: 1 },
  });

  useEffect(() => {
    if (!open) return;
    reset({ actualQuantity: 1 });
  }, [open, reset, nextStatus]);

  const onSubmit = handleSubmit(async (values) => {
    if (!nextStatus) return;
    await onConfirm({
      nextStatus,
      actualQuantity: needsActualQuantity ? values.actualQuantity : null,
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{pickLocalized(messages.productionOrder.actions.transitionStatus, locale)}</DialogTitle>
        </DialogHeader>

        {nextStatus ? (
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              {pickLocalized(messages.productionOrder.fields.status, locale)}:{" "}
              <span className="font-medium">{pickLocalized(messages.productionOrder.status[currentStatus], locale)}</span> {"->"}{" "}
              <span className="font-medium">{pickLocalized(messages.productionOrder.status[nextStatus], locale)}</span>
            </p>
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="grid gap-4">
          {needsActualQuantity ? (
            <div className="grid gap-2">
              <label htmlFor="production-order-actual-quantity" className="text-sm font-medium">
                {pickLocalized(messages.productionOrder.fields.actualQuantity, locale)}
              </label>
              <Input
                id="production-order-actual-quantity"
                type="number"
                min={1}
                className={cn(formState.errors.actualQuantity && "border-destructive")}
                {...register("actualQuantity", {
                  valueAsNumber: true,
                  required: "Actual quantity is required",
                  min: { value: 1, message: "Actual quantity must be at least 1" },
                })}
              />
              {formState.errors.actualQuantity?.message ? (
                <p className="text-sm text-destructive">{String(formState.errors.actualQuantity.message)}</p>
              ) : null}
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !nextStatus}>
              {pickLocalized(messages.productionOrder.actions.transitionStatus, locale)}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
