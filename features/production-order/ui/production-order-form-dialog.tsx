"use client";

import { Controller } from "react-hook-form";
import { useEffect, useMemo } from "react";

import { DatetimeInput } from "@/components/forms/datetime-input";
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
      return (res.data?.items ?? []).map((item) => ({ value: item.locationId, label: `${item.name} (${item.gln})` }));
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
          <div className="grid gap-2">
            <label htmlFor="production-order-number" className="text-sm font-medium">
              {pickLocalized(f.orderNumber, locale)}
            </label>
            <Input
              id="production-order-number"
              {...register("orderNumber")}
              className={cn(errors.orderNumber && "border-destructive")}
              autoComplete="off"
            />
            {errors.orderNumber?.message ? (
              <p className="text-sm text-destructive">{String(errors.orderNumber.message)}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">{pickLocalized(f.productId, locale)}</label>
            <Controller
              control={control}
              name="productId"
              render={({ field }) => (
                <EntitySelect
                  value={field.value || null}
                  onValueChange={(value) => setValue("productId", value ?? "", { shouldValidate: true })}
                  loadOptions={loadProductOptions}
                  placeholder={pickLocalized(f.productId, locale)}
                  disabled={isSubmitting}
                />
              )}
            />
            {errors.productId?.message ? (
              <p className="text-sm text-destructive">{String(errors.productId.message)}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label htmlFor="production-order-description" className="text-sm font-medium">
              {pickLocalized(f.description, locale)}
            </label>
            <Input
              id="production-order-description"
              {...register("description")}
              className={cn(errors.description && "border-destructive")}
              autoComplete="off"
            />
            {errors.description?.message ? (
              <p className="text-sm text-destructive">{String(errors.description.message)}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="production-order-planned-quantity" className="text-sm font-medium">
                {pickLocalized(f.plannedQuantity, locale)}
              </label>
              <Input
                id="production-order-planned-quantity"
                type="number"
                min={1}
                {...register("plannedQuantity", { valueAsNumber: true })}
                className={cn(errors.plannedQuantity && "border-destructive")}
              />
              {errors.plannedQuantity?.message ? (
                <p className="text-sm text-destructive">{String(errors.plannedQuantity.message)}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">{pickLocalized(f.productionLocationId, locale)}</label>
              <Controller
                control={control}
                name="productionLocationId"
                render={({ field }) => (
                  <EntitySelect
                    value={field.value || null}
                    onValueChange={(value) => setValue("productionLocationId", value ?? "", { shouldValidate: true })}
                    loadOptions={loadLocationOptions}
                    placeholder={pickLocalized(f.productionLocationId, locale)}
                    disabled={isSubmitting}
                  />
                )}
              />
              {errors.productionLocationId?.message ? (
                <p className="text-sm text-destructive">{String(errors.productionLocationId.message)}</p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium">{pickLocalized(f.plannedStartTime, locale)}</label>
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
              {errors.plannedStartTime?.message ? (
                <p className="text-sm text-destructive">{String(errors.plannedStartTime.message)}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">{pickLocalized(f.plannedEndTime, locale)}</label>
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
              {errors.plannedEndTime?.message ? (
                <p className="text-sm text-destructive">{String(errors.plannedEndTime.message)}</p>
              ) : null}
            </div>
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
