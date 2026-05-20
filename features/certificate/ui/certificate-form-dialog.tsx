"use client";

import { Controller } from "react-hook-form";
import { useMemo, useEffect } from "react";

import { FormField } from "@/components/forms/form-field";
import { optionalFieldPlaceholder } from "@/components/forms/form-field-label";
import { EntitySelect } from "@/components/forms/entity-select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth";
import { formatLocationOptionLabel } from "@/features/location/lib/format-location-label";
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
  const cancelLabel = pickLocalized(messages.common.cancel, locale);
  const productLabel = pickLocalized(f.productId, locale);
  const locationLabel = pickLocalized(f.locationId, locale);

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
      return (res.data?.items ?? []).map((item) => ({
        value: item.locationId,
        label: formatLocationOptionLabel(item.name, item.gln, item.extension),
      }));
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
          <FormField label={productLabel} optional error={errors.productId?.message}>
            <Controller
              control={control}
              name="productId"
              render={({ field }) => (
                <EntitySelect
                  value={field.value?.trim() ? field.value : null}
                  onValueChange={(value) => setValue("productId", value ?? "", { shouldValidate: true })}
                  loadOptions={loadProductOptions}
                  placeholder={optionalFieldPlaceholder(productLabel, locale)}
                  searchPlaceholder={productLabel}
                  disabled={isSubmitting}
                  className={cn(errors.productId && "rounded-md border border-destructive")}
                />
              )}
            />
          </FormField>
          <FormField label={locationLabel} optional error={errors.locationId?.message}>
            <Controller
              control={control}
              name="locationId"
              render={({ field }) => (
                <EntitySelect
                  value={field.value?.trim() ? field.value : null}
                  onValueChange={(value) => setValue("locationId", value ?? "", { shouldValidate: true })}
                  loadOptions={loadLocationOptions}
                  placeholder={optionalFieldPlaceholder(locationLabel, locale)}
                  searchPlaceholder={locationLabel}
                  disabled={isSubmitting}
                  className={cn(errors.locationId && "rounded-md border border-destructive")}
                />
              )}
            />
          </FormField>
          <FormField
            id="certificate-name"
            label={pickLocalized(f.name, locale)}
            required
            error={errors.name?.message}
          >
            <Input
              id="certificate-name"
              {...register("name")}
              aria-required
              className={cn(errors.name && "border-destructive")}
              autoComplete="off"
            />
          </FormField>
          <FormField id="certificate-url" label={pickLocalized(f.url, locale)} optional error={errors.url?.message}>
            <Input
              id="certificate-url"
              {...register("url")}
              className={cn(errors.url && "border-destructive")}
              autoComplete="url"
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
