"use client";

import { FormField } from "@/components/forms/form-field";
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
import { messages, pickLocalized, useLocale } from "@/lib/i18n";
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
};

export function TenantFormDialog({ open, onOpenChange, editing, onSaved }: TenantFormDialogProps) {
  const { locale } = useLocale();
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
  const cancelLabel = pickLocalized(messages.common.cancel, locale);

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
      <DialogContent className="sm:max-w-xl" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4">
          <FormField
            id="tenant-name"
            label={pickLocalized(f.name, locale)}
            required
            error={errors.name?.message}
          >
            <Input
              id="tenant-name"
              {...register("name")}
              aria-required
              className={cn(errors.name && "border-destructive")}
              autoComplete="off"
            />
          </FormField>
          <FormField id="tenant-gcp" label={pickLocalized(f.gcp, locale)} optional>
            <Input id="tenant-gcp" {...register("gcp")} autoComplete="off" />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {cancelLabel}
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
