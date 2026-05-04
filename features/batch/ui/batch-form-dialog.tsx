"use client";

import { Controller } from "react-hook-form";
import { useEffect, useMemo } from "react";

import { DateInput } from "@/components/forms/date-input";
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
import { createBatch } from "@/lib/api/services/batch.service";
import { listProducts } from "@/lib/api/services/product.service";
import { listProductionOrders } from "@/lib/api/services/production-order.service";
import {
  applyApiValidationErrors,
  validationErrorsFromApiError,
} from "@/lib/forms/api-error-to-form";
import { defaultLocale, messages, pickLocalized } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import { toastApiError, toastMutationSuccess } from "@/lib/ui/api-toast";
import { cn } from "@/lib/utils";

import type { BatchFormValues } from "../hooks/use-batch-form";
import { useBatchForm } from "../hooks/use-batch-form";

type BatchFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  locale?: Locale;
};

export function BatchFormDialog({
  open,
  onOpenChange,
  onSaved,
  locale = defaultLocale,
}: BatchFormDialogProps) {
  const form = useBatchForm();
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
      lotNumber: "",
      productId: "",
      productionOrderId: "",
      plannedQuantity: 1,
      productionDate: "",
      packDate: "",
      bestBeforeDate: "",
      expiryDate: "",
    });
    clearErrors();
  }, [open, reset, clearErrors]);

  const f = messages.batch.fields;
  const title = pickLocalized(messages.batch.actions.create, locale);

  const loadProductOptions = useMemo(
    () => async (query: string) => {
      const res = await listProducts({ keyword: query || undefined, page: 1, size: 50 });
      return (res.data?.items ?? []).map((item) => ({ value: item.productId, label: `${item.name} (${item.gtin})` }));
    },
    []
  );

  const loadProductionOrderOptions = useMemo(
    () => async (query: string) => {
      const res = await listProductionOrders({ keyword: query || undefined, page: 1, size: 50 });
      return (res.data?.items ?? []).map((item) => ({ value: item.productionOrderId, label: item.orderNumber }));
    },
    []
  );

  const onSubmit = handleSubmit(async (values: BatchFormValues) => {
    clearErrors();
    try {
      await createBatch({
        lotNumber: values.lotNumber.trim(),
        productId: values.productId,
        plannedQuantity: values.plannedQuantity,
        productionOrderId: values.productionOrderId?.trim() ? values.productionOrderId : null,
        productionDate: values.productionDate?.trim() || null,
        packDate: values.packDate?.trim() || null,
        bestBeforeDate: values.bestBeforeDate?.trim() || null,
        expiryDate: values.expiryDate?.trim() || null,
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
            <label htmlFor="batch-lot-number" className="text-sm font-medium">
              {pickLocalized(f.lotNumber, locale)}
            </label>
            <Input
              id="batch-lot-number"
              {...register("lotNumber")}
              className={cn(errors.lotNumber && "border-destructive")}
              autoComplete="off"
            />
            {errors.lotNumber?.message ? (
              <p className="text-sm text-destructive">{String(errors.lotNumber.message)}</p>
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
            <label className="text-sm font-medium">{pickLocalized(f.productionOrderId, locale)}</label>
            <Controller
              control={control}
              name="productionOrderId"
              render={({ field }) => (
                <EntitySelect
                  value={field.value || null}
                  onValueChange={(value) => setValue("productionOrderId", value ?? "", { shouldValidate: true })}
                  loadOptions={loadProductionOrderOptions}
                  placeholder={pickLocalized(f.productionOrderId, locale)}
                  disabled={isSubmitting}
                />
              )}
            />
            {errors.productionOrderId?.message ? (
              <p className="text-sm text-destructive">{String(errors.productionOrderId.message)}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label htmlFor="batch-planned-quantity" className="text-sm font-medium">
              {pickLocalized(f.plannedQuantity, locale)}
            </label>
            <Input
              id="batch-planned-quantity"
              type="number"
              min={1}
              {...register("plannedQuantity", { valueAsNumber: true })}
              className={cn(errors.plannedQuantity && "border-destructive")}
            />
            {errors.plannedQuantity?.message ? (
              <p className="text-sm text-destructive">{String(errors.plannedQuantity.message)}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium">{pickLocalized(f.productionDate, locale)}</label>
              <Controller
                control={control}
                name="productionDate"
                render={({ field }) => (
                  <DateInput
                    value={field.value || null}
                    onValueChange={(value) => setValue("productionDate", value ?? "", { shouldValidate: true })}
                    disabled={isSubmitting}
                  />
                )}
              />
              {errors.productionDate?.message ? (
                <p className="text-sm text-destructive">{String(errors.productionDate.message)}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">{pickLocalized(f.packDate, locale)}</label>
              <Controller
                control={control}
                name="packDate"
                render={({ field }) => (
                  <DateInput
                    value={field.value || null}
                    onValueChange={(value) => setValue("packDate", value ?? "", { shouldValidate: true })}
                    disabled={isSubmitting}
                  />
                )}
              />
              {errors.packDate?.message ? (
                <p className="text-sm text-destructive">{String(errors.packDate.message)}</p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium">{pickLocalized(f.bestBeforeDate, locale)}</label>
              <Controller
                control={control}
                name="bestBeforeDate"
                render={({ field }) => (
                  <DateInput
                    value={field.value || null}
                    onValueChange={(value) => setValue("bestBeforeDate", value ?? "", { shouldValidate: true })}
                    disabled={isSubmitting}
                  />
                )}
              />
              {errors.bestBeforeDate?.message ? (
                <p className="text-sm text-destructive">{String(errors.bestBeforeDate.message)}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">{pickLocalized(f.expiryDate, locale)}</label>
              <Controller
                control={control}
                name="expiryDate"
                render={({ field }) => (
                  <DateInput
                    value={field.value || null}
                    onValueChange={(value) => setValue("expiryDate", value ?? "", { shouldValidate: true })}
                    disabled={isSubmitting}
                  />
                )}
              />
              {errors.expiryDate?.message ? (
                <p className="text-sm text-destructive">{String(errors.expiryDate.message)}</p>
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
