"use client";

import { Controller } from "react-hook-form";
import { useEffect, useMemo } from "react";

import { DateInput } from "@/components/forms/date-input";
import { FormField } from "@/components/forms/form-field";
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
import {
  getProductionOrderById,
  listProductionOrders,
} from "@/lib/api/services/production-order.service";
import { normalizeProductionOrderStatus } from "@/lib/production/production-order-status";
import {
  applyApiValidationErrors,
  validationErrorsFromApiError,
} from "@/lib/forms/api-error-to-form";
import { messages, pickLocalized, useLocale } from "@/lib/i18n";
import { toastApiError, toastMutationSuccess } from "@/lib/ui/api-toast";
import { cn } from "@/lib/utils";

import type { BatchFormValues } from "../hooks/use-batch-form";
import { useBatchForm } from "../hooks/use-batch-form";

type BatchFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
};

export function BatchFormDialog({ open, onOpenChange, onSaved }: BatchFormDialogProps) {
  const { locale } = useLocale();
  const form = useBatchForm();
  const {
    register,
    control,
    handleSubmit,
    reset,
    clearErrors,
    setValue,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const productionOrderId = watch("productionOrderId");
  const productLockedByOrder = Boolean(productionOrderId?.trim());

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
  const cancelLabel = pickLocalized(messages.common.cancel, locale);
  const productionOrderLabel = pickLocalized(f.productionOrderId, locale);
  const productLabel = pickLocalized(f.productId, locale);

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
      return (res.data?.items ?? [])
        .filter((item) => {
          const status = normalizeProductionOrderStatus(item.status);
          return status === "Confirmed" || status === "InProduction";
        })
        .map((item) => ({ value: item.productionOrderId, label: item.orderNumber }));
    },
    []
  );

  const onProductionOrderChange = async (value: string | null) => {
    const nextId = value ?? "";
    setValue("productionOrderId", nextId, { shouldValidate: true });
    if (!nextId) return;

    try {
      const res = await getProductionOrderById(nextId);
      const order = res.data;
      if (!order) return;
      setValue("productId", order.productId, { shouldValidate: true });
      if (order.plannedQuantity >= 1) {
        setValue("plannedQuantity", order.plannedQuantity, { shouldValidate: true });
      }
    } catch (e: unknown) {
      toastApiError(e, locale);
    }
  };

  const onSubmit = handleSubmit(async (values: BatchFormValues) => {
    clearErrors();
    try {
      await createBatch({
        lotNumber: values.lotNumber.trim(),
        productId: values.productId,
        plannedQuantity: values.plannedQuantity,
        productionOrderId: values.productionOrderId.trim(),
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
          <FormField
            id="batch-lot-number"
            label={pickLocalized(f.lotNumber, locale)}
            required
            error={errors.lotNumber?.message}
          >
            <Input
              id="batch-lot-number"
              {...register("lotNumber")}
              aria-required
              className={cn(errors.lotNumber && "border-destructive")}
              autoComplete="off"
            />
          </FormField>

          <FormField
            label={productionOrderLabel}
            required
            error={errors.productionOrderId?.message}
          >
            <Controller
              control={control}
              name="productionOrderId"
              render={({ field }) => (
                <EntitySelect
                  value={field.value?.trim() ? field.value : null}
                  onValueChange={(value) => void onProductionOrderChange(value)}
                  loadOptions={loadProductionOrderOptions}
                  searchPlaceholder={productionOrderLabel}
                  disabled={isSubmitting}
                  className={cn(errors.productionOrderId && "rounded-md border border-destructive")}
                />
              )}
            />
          </FormField>

          <FormField
            label={productLabel}
            required
            hint={
              productLockedByOrder
                ? pickLocalized(messages.batch.createForm.productFromOrderHint, locale)
                : undefined
            }
            error={errors.productId?.message}
          >
            <Controller
              control={control}
              name="productId"
              render={({ field }) => (
                <EntitySelect
                  value={field.value || null}
                  onValueChange={(value) => setValue("productId", value ?? "", { shouldValidate: true })}
                  loadOptions={loadProductOptions}
                  placeholder={productLabel}
                  disabled={isSubmitting || productLockedByOrder}
                />
              )}
            />
          </FormField>

          <FormField
            id="batch-planned-quantity"
            label={pickLocalized(f.plannedQuantity, locale)}
            required
            error={errors.plannedQuantity?.message}
          >
            <Input
              id="batch-planned-quantity"
              type="number"
              min={1}
              {...register("plannedQuantity", { valueAsNumber: true })}
              aria-required
              className={cn(errors.plannedQuantity && "border-destructive")}
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label={pickLocalized(f.productionDate, locale)} optional error={errors.productionDate?.message}>
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
            </FormField>
            <FormField label={pickLocalized(f.packDate, locale)} optional error={errors.packDate?.message}>
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
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label={pickLocalized(f.bestBeforeDate, locale)} optional error={errors.bestBeforeDate?.message}>
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
            </FormField>
            <FormField label={pickLocalized(f.expiryDate, locale)} optional error={errors.expiryDate?.message}>
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
