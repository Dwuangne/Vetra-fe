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
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="product-gtin" className="text-sm font-medium">
              {pickLocalized(f.gtin, locale)}
            </label>
            <Input
              id="product-gtin"
              {...register("gtin")}
              className={cn(errors.gtin && "border-destructive")}
              autoComplete="off"
            />
            {errors.gtin?.message ? (
              <p className="text-sm text-destructive">{String(errors.gtin.message)}</p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <label htmlFor="product-name" className="text-sm font-medium">
              {pickLocalized(f.name, locale)}
            </label>
            <Input
              id="product-name"
              {...register("name")}
              className={cn(errors.name && "border-destructive")}
              autoComplete="off"
            />
            {errors.name?.message ? (
              <p className="text-sm text-destructive">{String(errors.name.message)}</p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <label htmlFor="product-image-url" className="text-sm font-medium">
              {imageUrlLabel}
            </label>
            <Input
              id="product-image-url"
              {...register("imageUrl")}
              className={cn(errors.imageUrl && "border-destructive")}
              autoComplete="off"
              placeholder="Fill image URL"
            />
            {errors.imageUrl?.message ? (
              <p className="text-sm text-destructive">{String(errors.imageUrl.message)}</p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <label htmlFor="product-description" className="text-sm font-medium">
              {pickLocalized(f.description, locale)}
            </label>
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
            {errors.description?.message ? (
              <p className="text-sm text-destructive">{String(errors.description.message)}</p>
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
