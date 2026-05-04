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
import type { PartyDto } from "@/lib/api/types/party";
import { createParty, updateParty } from "@/lib/api/services/party.service";
import {
  applyApiValidationErrors,
  validationErrorsFromApiError,
} from "@/lib/forms/api-error-to-form";
import { messages, pickLocalized, useLocale } from "@/lib/i18n";
import { toastApiError, toastMutationSuccess } from "@/lib/ui/api-toast";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

import type { PartyFormValues } from "../hooks/use-party-form";
import { usePartyForm } from "../hooks/use-party-form";

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
      reset({ gln: editing.gln, name: editing.name });
    } else {
      reset({ gln: "", name: "" });
    }
    clearErrors();
  }, [open, editing, reset, clearErrors]);

  const title = editing
    ? pickLocalized(messages.party.actions.update, locale)
    : pickLocalized(messages.party.actions.create, locale);
  const f = messages.party.fields;

  const onSubmit = handleSubmit(async (values: PartyFormValues) => {
    clearErrors();
    try {
      if (editing) {
        await updateParty(editing.partyId, { gln: values.gln, name: values.name });
      } else {
        await createParty({ gln: values.gln, name: values.name });
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
            <label htmlFor="party-gln" className="text-sm font-medium">
              {pickLocalized(f.gln, locale)}
            </label>
            <Input
              id="party-gln"
              {...register("gln")}
              className={cn(errors.gln && "border-destructive")}
              autoComplete="off"
            />
            {errors.gln?.message ? (
              <p className="text-sm text-destructive">{String(errors.gln.message)}</p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <label htmlFor="party-name" className="text-sm font-medium">
              {pickLocalized(f.name, locale)}
            </label>
            <Input
              id="party-name"
              {...register("name")}
              className={cn(errors.name && "border-destructive")}
              autoComplete="off"
            />
            {errors.name?.message ? (
              <p className="text-sm text-destructive">{String(errors.name.message)}</p>
            ) : null}
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
