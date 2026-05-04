"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const batchFormSchema = z
  .object({
    lotNumber: z.string().min(1, "Lot number is required"),
    productId: z.string().min(1, "Product is required"),
    productionOrderId: z.string().optional(),
    plannedQuantity: z.number().int().min(1, "Planned quantity must be at least 1"),
    productionDate: z.string().optional(),
    packDate: z.string().optional(),
    bestBeforeDate: z.string().optional(),
    expiryDate: z.string().optional(),
  })
  .refine(
    (values) =>
      !values.packDate || !values.productionDate || values.packDate >= values.productionDate,
    {
      message: "Pack date must be on or after production date",
      path: ["packDate"],
    }
  )
  .refine(
    (values) =>
      !values.bestBeforeDate || !values.packDate || values.bestBeforeDate >= values.packDate,
    {
      message: "Best before date must be on or after pack date",
      path: ["bestBeforeDate"],
    }
  )
  .refine(
    (values) =>
      !values.expiryDate || !values.bestBeforeDate || values.expiryDate >= values.bestBeforeDate,
    {
      message: "Expiry date must be on or after best before date",
      path: ["expiryDate"],
    }
  );

export type BatchFormValues = z.infer<typeof batchFormSchema>;

export function useBatchForm(defaults?: Partial<BatchFormValues>) {
  return useForm<BatchFormValues>({
    resolver: zodResolver(batchFormSchema),
    defaultValues: {
      lotNumber: defaults?.lotNumber ?? "",
      productId: defaults?.productId ?? "",
      productionOrderId: defaults?.productionOrderId ?? "",
      plannedQuantity: defaults?.plannedQuantity ?? 1,
      productionDate: defaults?.productionDate ?? "",
      packDate: defaults?.packDate ?? "",
      bestBeforeDate: defaults?.bestBeforeDate ?? "",
      expiryDate: defaults?.expiryDate ?? "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
}
