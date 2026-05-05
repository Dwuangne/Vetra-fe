"use client";

import { Controller } from "react-hook-form";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { EntitySelect } from "@/components/forms/entity-select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth";
import { listLocations } from "@/lib/api/services/location.service";
import { listProducts } from "@/lib/api/services/product.service";
import { createCertificate, updateCertificate } from "@/lib/api/services/certificate.service";
import type { CertificateDto } from "@/lib/api/types/certificate";
import {
  applyApiValidationErrors,
  validationErrorsFromApiError,
} from "@/lib/forms/api-error-to-form";
import { messages, pickLocalized, useLocale } from "@/lib/i18n";
import { toastApiError, toastMutationSuccess } from "@/lib/ui/api-toast";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

import type { CertificateFormValues } from "../hooks/use-certificate-form";
import { useCertificateForm } from "../hooks/use-certificate-form";

type CertificateFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: CertificateDto | null;
  onSaved: () => void;
};

export function CertificateFormDialog({ open, onOpenChange, editing, onSaved }: CertificateFormDialogProps) {
  const { locale } = useLocale();
  const { user } = useAuth();
  const tenantId = user?.tenantId?.trim() || undefined;
  const form = useCertificateForm();
  const {
    register,
    control,
    handleSubmit,
    reset,
    clearErrors,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    if (!open) return;
    reset(
      editing
        ? {
            productId: editing.productId ?? "",
            locationId: editing.locationId ?? "",
            name: editing.name,
            url: editing.url ?? "",
          }
        : { productId: "", locationId: "", name: "", url: "" }
    );
    clearErrors();
  }, [open, editing, reset, clearErrors, tenantId]);

  const title = editing
    ? pickLocalized(messages.certificate.actions.update, locale)
    : pickLocalized(messages.certificate.actions.create, locale);
  const f = messages.certificate.fields;

  const loadProductOptions = useMemo(
    () => async (query: string) => {
      const res = await listProducts({ keyword: query || undefined, page: 1, size: 50, tenantId });
      return (res.data?.items ?? []).map((item) => ({ value: item.productId, label: `${item.name} (${item.gtin})` }));
    },
    [tenantId]
  );

  const loadLocationOptions = useMemo(
    () => async (query: string) => {
      const res = await listLocations({ keyword: query || undefined, page: 1, size: 50, tenantId });
      return (res.data?.items ?? []).map((item) => ({ value: item.locationId, label: `${item.name} (${item.gln}.${item.extension})` }));
    },
    [tenantId]
  );

  const onSubmit = handleSubmit(async (values: CertificateFormValues) => {
    clearErrors();
    const payload = {
      productId: values.productId?.trim() ? values.productId.trim() : null,
      locationId: values.locationId?.trim() ? values.locationId.trim() : null,
      name: values.name,
      url: values.url?.trim() ? values.url.trim() : null,
    };

    try {
      if (editing) {
        await updateCertificate(editing.certificateId, payload);
      } else {
        await createCertificate(payload);
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
          <div className="grid gap-2">
            <label className="text-sm font-medium">
              {pickLocalized(f.productId, locale)}
            </label>
            <Controller
              control={control}
              name="productId"
              render={({ field }) => (
                <EntitySelect
                  value={field.value?.trim() ? field.value : null}
                  onValueChange={(value) => setValue("productId", value ?? "", { shouldValidate: true })}
                  loadOptions={loadProductOptions}
                  placeholder={`${pickLocalized(f.productId, locale)} (optional)`}
                  searchPlaceholder={pickLocalized(f.productId, locale)}
                  disabled={isSubmitting}
                  className={cn(errors.productId && "rounded-md border border-destructive")}
                />
              )}
            />
            {errors.productId?.message ? (
              <p className="text-sm text-destructive">{String(errors.productId.message)}</p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">
              {pickLocalized(f.locationId, locale)}
            </label>
            <Controller
              control={control}
              name="locationId"
              render={({ field }) => (
                <EntitySelect
                  value={field.value?.trim() ? field.value : null}
                  onValueChange={(value) => setValue("locationId", value ?? "", { shouldValidate: true })}
                  loadOptions={loadLocationOptions}
                  placeholder={`${pickLocalized(f.locationId, locale)} (optional)`}
                  searchPlaceholder={pickLocalized(f.locationId, locale)}
                  disabled={isSubmitting}
                  className={cn(errors.locationId && "rounded-md border border-destructive")}
                />
              )}
            />
            {errors.locationId?.message ? (
              <p className="text-sm text-destructive">{String(errors.locationId.message)}</p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <label htmlFor="certificate-name" className="text-sm font-medium">
              {pickLocalized(f.name, locale)}
            </label>
            <Input
              id="certificate-name"
              {...register("name")}
              className={cn(errors.name && "border-destructive")}
              autoComplete="off"
            />
            {errors.name?.message ? (
              <p className="text-sm text-destructive">{String(errors.name.message)}</p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <label htmlFor="certificate-url" className="text-sm font-medium">
              {pickLocalized(f.url, locale)}
            </label>
            <Input
              id="certificate-url"
              {...register("url")}
              className={cn(errors.url && "border-destructive")}
              autoComplete="url"
            />
            {errors.url?.message ? (
              <p className="text-sm text-destructive">{String(errors.url.message)}</p>
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
