"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { TenantDto } from "@/lib/api/types/tenant";
import { createTenant, updateTenant } from "@/lib/api/services/tenant.service";
import {
  applyApiValidationErrors,
  validationErrorsFromApiError,
} from "@/lib/forms/api-error-to-form";
import { defaultLocale } from "@/lib/i18n";
import { messages, pickLocalized } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import { toastApiError, toastMutationSuccess } from "@/lib/ui/api-toast";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

import type { TenantFormValues } from "../hooks/use-tenant-form";
import { useTenantForm } from "../hooks/use-tenant-form";

type TenantFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: TenantDto | null;
  onSaved: () => void;
  locale?: Locale;
};

export function TenantFormDialog({
  open,
  onOpenChange,
  editing,
  onSaved,
  locale = defaultLocale,
}: TenantFormDialogProps) {
  const form = useTenantForm();
  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    if (!open) return;
    if (editing) {
      reset({ name: editing.name, gcp: editing.gcp ?? "" });
    } else {
      reset({ name: "", gcp: "" });
    }
    clearErrors();
  }, [open, editing, reset, clearErrors]);

  const title = editing
    ? pickLocalized(messages.tenant.actions.update, locale)
    : pickLocalized(messages.tenant.actions.create, locale);
  const f = messages.tenant.fields;

  const onSubmit = handleSubmit(async (values: TenantFormValues) => {
    clearErrors();
    const gcp = values.gcp?.trim()?.length ? values.gcp.trim() : null;
    try {
      if (editing) {
        await updateTenant(editing.tenantId, { name: values.name, gcp });
      } else {
        await createTenant({ name: values.name, gcp });
      }
      toastMutationSuccess(locale);
      onSaved();
      onOpenChange(false);
    } catch (e: unknown) {
      const fieldCount = applyApiValidationErrors(validationErrorsFromApiError(e), setError);
      if (fieldCount === 0) {
        toastApiError(e, locale);
      }
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="tenant-name" className="text-sm font-medium">
              {pickLocalized(f.name, locale)}
            </label>
            <Input
              id="tenant-name"
              {...register("name")}
              className={cn(errors.name && "border-destructive")}
              autoComplete="off"
            />
            {errors.name?.message ? (
              <p className="text-sm text-destructive">{String(errors.name.message)}</p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <label htmlFor="tenant-gcp" className="text-sm font-medium">
              {pickLocalized(f.gcp, locale)}
            </label>
            <Input id="tenant-gcp" {...register("gcp")} autoComplete="off" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {title}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
