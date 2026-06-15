"use client";

import { Controller } from "react-hook-form";
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
import { createFormTemplate, updateFormTemplate } from "@/lib/api/services/form-template.service";
import type { FormTemplateDto } from "@/lib/api/types/form-template";
import {
  applyApiValidationErrors,
  validationErrorsFromApiError,
} from "@/lib/forms/api-error-to-form";
import { messages, pickLocalized, useLocale } from "@/lib/i18n";
import { ALL_BIZ_STEPS, getBizStepLabel } from "@/lib/production/cbv-biz-steps";
import { toastApiError, toastMutationSuccess } from "@/lib/ui/api-toast";
import { cn } from "@/lib/utils";

import type { FormTemplateFormValues } from "../hooks/use-form-template-form";
import { useFormTemplateForm } from "../hooks/use-form-template-form";

type FormTemplateFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: FormTemplateDto | null;
  onSaved: () => void;
};

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

export function FormTemplateFormDialog({
  open,
  onOpenChange,
  editing,
  onSaved,
}: FormTemplateFormDialogProps) {
  const { locale } = useLocale();
  const form = useFormTemplateForm();
  const {
    register,
    control,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    if (!open) return;
    reset(
      editing
        ? {
            name: editing.name,
            bizStep: editing.bizStep as FormTemplateFormValues["bizStep"],
          }
        : { name: "", bizStep: "urn:epcglobal:cbv:bizstep:commissioning" }
    );
    clearErrors();
  }, [open, editing, reset, clearErrors]);

  const title = editing
    ? pickLocalized(messages.formTemplate.actions.update, locale)
    : pickLocalized(messages.formTemplate.actions.create, locale);
  const f = messages.formTemplate.fields;
  const cancelLabel = pickLocalized(messages.common.cancel, locale);

  const onSubmit = handleSubmit(async (values: FormTemplateFormValues) => {
    clearErrors();
    const payload = {
      name: values.name.trim(),
      bizStep: values.bizStep,
    };

    try {
      if (editing) {
        await updateFormTemplate(editing.templateId, payload);
      } else {
        await createFormTemplate(payload);
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
            id="form-template-name"
            label={pickLocalized(f.name, locale)}
            required
            error={errors.name?.message}
          >
            <Input
              id="form-template-name"
              {...register("name")}
              aria-required
              maxLength={200}
              className={cn(errors.name && "border-destructive")}
              autoComplete="off"
            />
          </FormField>
          <FormField
            label={pickLocalized(f.bizStep, locale)}
            required
            error={errors.bizStep?.message}
          >
            <Controller
              control={control}
              name="bizStep"
              render={({ field }) => (
                <select
                  id="form-template-biz-step"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  disabled={isSubmitting}
                  aria-required
                  className={cn(selectClass, errors.bizStep && "border-destructive")}
                >
                  {ALL_BIZ_STEPS.map((step) => (
                    <option key={step} value={step}>
                      {getBizStepLabel(step, locale)}
                    </option>
                  ))}
                </select>
              )}
            />
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
