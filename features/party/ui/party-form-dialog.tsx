"use client";

import { useEffect } from "react";

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
import type { PartyDto } from "@/lib/api/types/party";
import { createParty, updateParty } from "@/lib/api/services/party.service";
import {
  applyApiValidationErrors,
  validationErrorsFromApiError,
} from "@/lib/forms/api-error-to-form";
import { messages, pickLocalized, useLocale } from "@/lib/i18n";
import { toastApiError, toastMutationSuccess } from "@/lib/ui/api-toast";
import { cn } from "@/lib/utils";

import type { PartyFormValues } from "../hooks/use-party-form";
import { partyFormValuesToRequest, usePartyForm } from "../hooks/use-party-form";

type PartyFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: PartyDto | null;
  onSaved: () => void;
};

export function PartyFormDialog({ open, onOpenChange, editing, onSaved }: PartyFormDialogProps) {
  const { locale } = useLocale();
  const form = usePartyForm();
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
      reset({
        gln: editing.gln ?? "",
        name: editing.name,
        taxCode: editing.taxCode ?? "",
        registeredAddress: editing.registeredAddress ?? "",
        phone: editing.phone ?? "",
        email: editing.email ?? "",
      });
    } else {
      reset({
        gln: "",
        name: "",
        taxCode: "",
        registeredAddress: "",
        phone: "",
        email: "",
      });
    }
    clearErrors();
  }, [open, editing, reset, clearErrors]);

  const title = editing
    ? pickLocalized(messages.party.actions.update, locale)
    : pickLocalized(messages.party.actions.create, locale);
  const f = messages.party.fields;
  const cancelLabel = pickLocalized(messages.common.cancel, locale);

  const onSubmit = handleSubmit(async (values: PartyFormValues) => {
    clearErrors();
    const body = partyFormValuesToRequest(values);
    try {
      if (editing) {
        await updateParty(editing.partyId, body);
      } else {
        await createParty(body);
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
      <DialogContent className="sm:max-w-lg" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4">
          <FormField
            id="party-name"
            label={pickLocalized(f.name, locale)}
            required
            error={errors.name?.message}
          >
            <Input
              id="party-name"
              {...register("name")}
              aria-required
              className={cn(errors.name && "border-destructive")}
              autoComplete="organization"
            />
          </FormField>

          <FormField
            id="party-tax-code"
            label={pickLocalized(f.taxCode, locale)}
            hint={pickLocalized(f.taxCodeHint, locale)}
            error={errors.taxCode?.message}
          >
            <Input
              id="party-tax-code"
              {...register("taxCode")}
              className={cn(errors.taxCode && "border-destructive")}
              inputMode="numeric"
              autoComplete="off"
            />
          </FormField>

          <FormField
            id="party-gln"
            label={pickLocalized(f.gln, locale)}
            hint={pickLocalized(f.glnHint, locale)}
            error={errors.gln?.message}
          >
            <Input
              id="party-gln"
              {...register("gln")}
              className={cn(errors.gln && "border-destructive")}
              autoComplete="off"
            />
          </FormField>

          <FormField
            id="party-registered-address"
            label={pickLocalized(f.registeredAddress, locale)}
            hint={pickLocalized(f.registeredAddressHint, locale)}
            error={errors.registeredAddress?.message}
          >
            <textarea
              id="party-registered-address"
              {...register("registeredAddress")}
              rows={2}
              className={cn(
                "flex min-h-[4rem] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                errors.registeredAddress && "border-destructive"
              )}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="party-phone"
              label={pickLocalized(f.phone, locale)}
              hint={pickLocalized(f.phoneHint, locale)}
              error={errors.phone?.message}
            >
              <Input
                id="party-phone"
                {...register("phone")}
                className={cn(errors.phone && "border-destructive")}
                type="tel"
                autoComplete="tel"
              />
            </FormField>

            <FormField
              id="party-email"
              label={pickLocalized(f.email, locale)}
              hint={pickLocalized(f.emailHint, locale)}
              error={errors.email?.message}
            >
              <Input
                id="party-email"
                {...register("email")}
                className={cn(errors.email && "border-destructive")}
                type="email"
                autoComplete="email"
              />
            </FormField>
          </div>

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
