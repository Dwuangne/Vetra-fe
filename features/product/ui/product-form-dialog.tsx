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
import type { ProductDto } from "@/lib/api/types/product";
import { createProduct, updateProduct } from "@/lib/api/services/product.service";
import {
  applyApiValidationErrors,
  validationErrorsFromApiError,
} from "@/lib/forms/api-error-to-form";
import { messages, pickLocalized, useLocale } from "@/lib/i18n";
import { toastApiError, toastMutationSuccess } from "@/lib/ui/api-toast";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { Controller } from "react-hook-form";

import type { ProductFormValues } from "../hooks/use-product-form";
import { useProductForm } from "../hooks/use-product-form";
import { ProductDescriptionEditor } from "./product-description-editor";

type ProductFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: ProductDto | null;
  onSaved: () => void;
};

export function ProductFormDialog({ open, onOpenChange, editing, onSaved }: ProductFormDialogProps) {
  const { locale } = useLocale();
  const form = useProductForm();
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
        gtin: editing.gtin,
        name: editing.name,
        imageUrl: editing.imageUrl,
        description: editing.description ?? "",
      });
    } else {
      reset({ gtin: "", name: "", imageUrl: "", description: "" });
    }
    clearErrors();
  }, [open, editing, reset, clearErrors]);

  const title = editing
    ? pickLocalized(messages.product.actions.update, locale)
    : pickLocalized(messages.product.actions.create, locale);
  const f = messages.product.fields;
  const imageUrlLabel = f.imageUrl ? pickLocalized(f.imageUrl, locale) : "Image URL";
  const cancelLabel = pickLocalized(messages.common.cancel, locale);

  const onSubmit = handleSubmit(async (values: ProductFormValues) => {
    clearErrors();
    const rawDescription = values.description?.trim() ?? "";
    const descriptionTextOnly = rawDescription.replace(/<[^>]+>/g, "").trim();
    const description = descriptionTextOnly ? rawDescription : null;
    try {
      if (editing) {
        await updateProduct(editing.productId, {
          gtin: values.gtin,
          name: values.name,
          imageUrl: values.imageUrl.trim(),
          description,
        });
      } else {
        await createProduct({
          gtin: values.gtin,
          name: values.name,
          imageUrl: values.imageUrl.trim(),
          description,
        });
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
            id="product-gtin"
            label={pickLocalized(f.gtin, locale)}
            required
            error={errors.gtin?.message}
          >
            <Input
              id="product-gtin"
              {...register("gtin")}
              aria-required
              className={cn(errors.gtin && "border-destructive")}
              autoComplete="off"
            />
          </FormField>
          <FormField
            id="product-name"
            label={pickLocalized(f.name, locale)}
            required
            error={errors.name?.message}
          >
            <Input
              id="product-name"
              {...register("name")}
              aria-required
              className={cn(errors.name && "border-destructive")}
              autoComplete="off"
            />
          </FormField>
          <FormField id="product-image-url" label={imageUrlLabel} required error={errors.imageUrl?.message}>
            <Input
              id="product-image-url"
              {...register("imageUrl")}
              aria-required
              className={cn(errors.imageUrl && "border-destructive")}
              autoComplete="off"
              placeholder="Fill image URL"
            />
          </FormField>
          <FormField
            id="product-description"
            label={pickLocalized(f.description, locale)}
            optional
            error={errors.description?.message}
          >
            <Controller
              control={form.control}
              name="description"
              render={({ field }) => (
                <ProductDescriptionEditor
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                  className={cn(errors.description && "border-destructive")}
                />
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
