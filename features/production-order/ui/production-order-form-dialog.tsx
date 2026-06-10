"use client";

import { Controller } from "react-hook-form";
import { useEffect, useMemo } from "react";

import { DatetimeInput } from "@/components/forms/datetime-input";
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
import { formatLocationOptionLabel } from "@/features/location/lib/format-location-label";
import { listLocations } from "@/lib/api/services/location.service";
import { listProducts } from "@/lib/api/services/product.service";
import { createProductionOrder } from "@/lib/api/services/production-order.service";
import {
  applyApiValidationErrors,
  validationErrorsFromApiError,
} from "@/lib/forms/api-error-to-form";
import { messages, pickLocalized, useLocale } from "@/lib/i18n";
import { toastApiError, toastMutationSuccess } from "@/lib/ui/api-toast";
import { cn } from "@/lib/utils";

import type { ProductionOrderFormValues } from "../hooks/use-production-order-form";
import { useProductionOrderForm } from "../hooks/use-production-order-form";

type ProductionOrderFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
};

export function ProductionOrderFormDialog({ open, onOpenChange, onSaved }: ProductionOrderFormDialogProps) {
  const { locale } = useLocale();
  const form = useProductionOrderForm();
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
    reset({
      orderNumber: "",
      description: "",
      productId: "",
      plannedQuantity: 1,
      plannedStartTime: "",
      plannedEndTime: "",
      productionLocationId: "",
    });
    clearErrors();
  }, [open, reset, clearErrors]);

  const f = messages.productionOrder.fields;
  const title = pickLocalized(messages.productionOrder.actions.create, locale);
  const cancelLabel = pickLocalized(messages.common.cancel, locale);
  const productLabel = pickLocalized(f.productId, locale);
  const locationLabel = pickLocalized(f.productionLocationId, locale);

  const loadProductOptions = useMemo(
    () => async (query: string) => {
      const res = await listProducts({ keyword: query || undefined, page: 1, size: 50 });
      return (res.data?.items ?? []).map((item) => ({ value: item.productId, label: `${item.name} (${item.gtin})` }));
    },
    []
  );

  const loadLocationOptions = useMemo(
    () => async (query: string) => {
      const res = await listLocations({ keyword: query || undefined, page: 1, size: 50 });
      return (res.data?.items ?? []).map((item) => ({
        value: item.locationId,
        label: formatLocationOptionLabel(item.name, item.gln, item.extension),
      }));
    },
    []
  );

  const onSubmit = handleSubmit(async (values: ProductionOrderFormValues) => {
    clearErrors();
    try {
      await createProductionOrder({
        orderNumber: values.orderNumber.trim(),
        description: values.description?.trim() || null,
        productId: values.productId,
        plannedQuantity: values.plannedQuantity,
        plannedStartTime: values.plannedStartTime,
        plannedEndTime: values.plannedEndTime,
        productionLocationId: values.productionLocationId?.trim() ? values.productionLocationId : null,
      });

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
            id="production-order-number"
            label={pickLocalized(f.orderNumber, locale)}
            required
            error={errors.orderNumber?.message}
          >
            <Input
              id="production-order-number"
              {...register("orderNumber")}
              aria-required
              className={cn(errors.orderNumber && "border-destructive")}
              autoComplete="off"
            />
          </FormField>

          <FormField label={productLabel} required error={errors.productId?.message}>
            <Controller
              control={control}
              name="productId"
              render={({ field }) => (
                <EntitySelect
                  value={field.value || null}
                  onValueChange={(value) => setValue("productId", value ?? "", { shouldValidate: true })}
                  loadOptions={loadProductOptions}
                  disabled={isSubmitting}
                />
              )}
            />
          </FormField>

          <FormField
            id="production-order-description"
            label={pickLocalized(f.description, locale)}
            optional
            error={errors.description?.message}
          >
            <Input
              id="production-order-description"
              {...register("description")}
              className={cn(errors.description && "border-destructive")}
              autoComplete="off"
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              id="production-order-planned-quantity"
              label={pickLocalized(f.plannedQuantity, locale)}
              required
              error={errors.plannedQuantity?.message}
            >
              <Input
                id="production-order-planned-quantity"
                type="number"
                min={1}
                {...register("plannedQuantity", { valueAsNumber: true })}
                aria-required
                className={cn(errors.plannedQuantity && "border-destructive")}
              />
            </FormField>
            <FormField label={locationLabel} optional error={errors.productionLocationId?.message}>
              <Controller
                control={control}
                name="productionLocationId"
                render={({ field }) => (
                  <EntitySelect
                    value={field.value || null}
                    onValueChange={(value) => setValue("productionLocationId", value ?? "", { shouldValidate: true })}
                    loadOptions={loadLocationOptions}
                    placeholder={optionalFieldPlaceholder(locationLabel, locale)}
                    disabled={isSubmitting}
                  />
                )}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label={pickLocalized(f.plannedStartTime, locale)} required error={errors.plannedStartTime?.message}>
              <Controller
                control={control}
                name="plannedStartTime"
                render={({ field }) => (
                  <DatetimeInput
                    value={field.value || null}
                    onValueChange={(value) => setValue("plannedStartTime", value ?? "", { shouldValidate: true })}
                    disabled={isSubmitting}
                  />
                )}
              />
            </FormField>
            <FormField label={pickLocalized(f.plannedEndTime, locale)} required error={errors.plannedEndTime?.message}>
              <Controller
                control={control}
                name="plannedEndTime"
                render={({ field }) => (
                  <DatetimeInput
                    value={field.value || null}
                    onValueChange={(value) => setValue("plannedEndTime", value ?? "", { shouldValidate: true })}
                    disabled={isSubmitting}
                  />
                )}
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
