"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { generateProductInstances } from "@/lib/api/services/product-instance.service";
import { defaultLocale, messages, pickLocalized } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import { toastApiError, toastMutationSuccess } from "@/lib/ui/api-toast";
import { BRAND_PRIMARY_BUTTON_CLASS } from "@/lib/ui/brand";

type GenerateInstancesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchId: string;
  onGenerated: () => void;
  locale?: Locale;
};

export function GenerateInstancesDialog({
  open,
  onOpenChange,
  batchId,
  onGenerated,
  locale = defaultLocale,
}: GenerateInstancesDialogProps) {
  const [quantity, setQuantity] = useState("5");
  const [serialPrefix, setSerialPrefix] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setQuantity("5");
    setSerialPrefix("");
  }, [open]);

  const f = messages.productInstance.fields;
  const title = pickLocalized(messages.productInstance.generateDialog.title, locale);

  const submit = async () => {
    const n = Number.parseInt(quantity, 10);
    if (!Number.isFinite(n) || n < 1 || n > 10_000) {
      return;
    }
    setSubmitting(true);
    try {
      await generateProductInstances(batchId, {
        quantity: n,
        serialPrefix: serialPrefix.trim() ? serialPrefix.trim() : null,
      });
      toastMutationSuccess(locale);
      onOpenChange(false);
      onGenerated();
    } catch (e) {
      toastApiError(e, locale);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="gen-qty" className="text-sm font-medium leading-none">
              {pickLocalized(f.quantity, locale)}
            </label>
            <Input
              id="gen-qty"
              type="number"
              min={1}
              max={10_000}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={submitting}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="gen-prefix" className="text-sm font-medium leading-none">
              {pickLocalized(f.serialPrefix, locale)}
            </label>
            <Input
              id="gen-prefix"
              value={serialPrefix}
              onChange={(e) => setSerialPrefix(e.target.value)}
              disabled={submitting}
              placeholder="—"
              autoComplete="off"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button type="button" className={BRAND_PRIMARY_BUTTON_CLASS} onClick={() => void submit()} disabled={submitting}>
            {pickLocalized(messages.productInstance.actions.generate, locale)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
