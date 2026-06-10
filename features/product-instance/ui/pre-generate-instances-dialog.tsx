"use client";

import { useState } from "react";

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
import { preGenerateProductInstances } from "@/lib/api/services/product-instance.service";
import { messages, pickLocalized, translateCommon, useLocale } from "@/lib/i18n";
import { toastApiError, toastMutationSuccess } from "@/lib/ui/api-toast";
import { BRAND_PRIMARY_BUTTON_CLASS } from "@/lib/ui/brand";

type PreGenerateInstancesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  onPreGenerated: () => void;
};

export function PreGenerateInstancesDialog({
  open,
  onOpenChange,
  productId,
  onPreGenerated,
}: PreGenerateInstancesDialogProps) {
  const { locale } = useLocale();
  const [quantity, setQuantity] = useState("50");
  const [submitting, setSubmitting] = useState(false);

  const title = pickLocalized(messages.productInstance.pool.preGenerateDialog.title, locale);

  const submit = async () => {
    const parsed = Number.parseInt(quantity, 10);
    if (!Number.isFinite(parsed) || parsed < 1) return;

    setSubmitting(true);
    try {
      const res = await preGenerateProductInstances({ productId, quantity: parsed });
      if (!res.data) return;
      toastMutationSuccess(locale);
      onOpenChange(false);
      onPreGenerated();
    } catch (e) {
      toastApiError(e, locale);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {pickLocalized(messages.productInstance.pool.preGenerateDialog.hint, locale)}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="pre-gen-quantity" className="text-sm font-medium leading-none">
              {pickLocalized(messages.productInstance.fields.quantity, locale)}
            </label>
            <Input
              id="pre-gen-quantity"
              type="number"
              min={1}
              max={1_000_000}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={submitting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            {translateCommon("cancel", locale)}
          </Button>
          <Button type="button" className={BRAND_PRIMARY_BUTTON_CLASS} onClick={() => void submit()} disabled={submitting}>
            {pickLocalized(messages.productInstance.pool.actions.preGenerate, locale)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
