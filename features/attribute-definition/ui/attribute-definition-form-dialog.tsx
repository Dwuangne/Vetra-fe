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
import {
  createAttributeDefinition,
  updateAttributeDefinition,
} from "@/lib/api/services/attribute-definition.service";
import type { AttributeDefinitionDto } from "@/lib/api/types/attribute-definition";
import {
  applyApiValidationErrors,
  validationErrorsFromApiError,
} from "@/lib/forms/api-error-to-form";
import { messages, pickLocalized, useLocale } from "@/lib/i18n";
import { ATTRIBUTE_DATA_TYPES, getAttributeDataTypeLabel } from "@/lib/production/attribute-data-types";
import { toastApiError, toastMutationSuccess } from "@/lib/ui/api-toast";
import { cn } from "@/lib/utils";

import type { AttributeDefinitionFormValues } from "../hooks/use-attribute-definition-form";
import { useAttributeDefinitionForm } from "../hooks/use-attribute-definition-form";

type AttributeDefinitionFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: AttributeDefinitionDto | null;
  onSaved: () => void;
};

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

export function AttributeDefinitionFormDialog({
  open,
  onOpenChange,
  editing,
  onSaved,
}: AttributeDefinitionFormDialogProps) {
  const { locale } = useLocale();
  const form = useAttributeDefinitionForm();
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
            dataType: editing.dataType,
          }
        : { name: "", dataType: "STRING" }
    );
    clearErrors();
  }, [open, editing, reset, clearErrors]);

  const title = editing
    ? pickLocalized(messages.attributeDefinition.actions.update, locale)
    : pickLocalized(messages.attributeDefinition.actions.create, locale);
  const f = messages.attributeDefinition.fields;
  const cancelLabel = pickLocalized(messages.common.cancel, locale);

  const onSubmit = handleSubmit(async (values: AttributeDefinitionFormValues) => {
    clearErrors();
    const payload = {
      name: values.name.trim(),
      dataType: values.dataType,
    };

    try {
      if (editing) {
        await updateAttributeDefinition(editing.attrId, payload);
      } else {
        await createAttributeDefinition(payload);
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
            id="attribute-definition-name"
            label={pickLocalized(f.name, locale)}
            required
            error={errors.name?.message}
          >
            <Input
              id="attribute-definition-name"
              {...register("name")}
              aria-required
              maxLength={200}
              className={cn(errors.name && "border-destructive")}
              autoComplete="off"
            />
          </FormField>
          <FormField
            label={pickLocalized(f.dataType, locale)}
            required
            error={errors.dataType?.message}
          >
            <Controller
              control={control}
              name="dataType"
              render={({ field }) => (
                <select
                  id="attribute-definition-data-type"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  disabled={isSubmitting}
                  aria-required
                  className={cn(selectClass, errors.dataType && "border-destructive")}
                >
                  {ATTRIBUTE_DATA_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {getAttributeDataTypeLabel(type, locale)}
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
