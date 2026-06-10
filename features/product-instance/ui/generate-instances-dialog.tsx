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
import { generateProductInstances } from "@/lib/api/services/product-instance.service";
import { messages, pickLocalized, translateCommon, useLocale } from "@/lib/i18n";
import { toastApiError, toastMutationSuccess } from "@/lib/ui/api-toast";
import { BRAND_PRIMARY_BUTTON_CLASS } from "@/lib/ui/brand";

type GenerateInstancesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchId: string;
  onGenerated: () => void;
};

export function GenerateInstancesDialog({ open, onOpenChange, batchId, onGenerated }: GenerateInstancesDialogProps) {
  const { locale } = useLocale();
  const [submitting, setSubmitting] = useState(false);

  const title = pickLocalized(messages.productInstance.generateDialog.title, locale);

  const submit = async () => {
    setSubmitting(true);
    try {
      await generateProductInstances(batchId);
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {pickLocalized(messages.productInstance.generateDialog.batchScopeHint, locale)}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            {translateCommon("cancel", locale)}
          </Button>
          <Button type="button" className={BRAND_PRIMARY_BUTTON_CLASS} onClick={() => void submit()} disabled={submitting}>
            {pickLocalized(messages.productInstance.actions.generate, locale)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
