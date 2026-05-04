"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const productionOrderFieldsSchema = z
  .object({
    orderNumber: z.string().min(1, "Order number is required"),
    description: z.string().optional(),
    productId: z.string().min(1, "Product is required"),
    plannedQuantity: z.number().int().min(1, "Planned quantity must be at least 1"),
    plannedStartTime: z.string().min(1, "Planned start time is required"),
    plannedEndTime: z.string().min(1, "Planned end time is required"),
    productionLocationId: z.string().optional(),
  })
  .refine((values) => new Date(values.plannedEndTime).getTime() >= new Date(values.plannedStartTime).getTime(), {
    message: "Planned end time must be later than planned start time",
    path: ["plannedEndTime"],
  });

export type ProductionOrderFormValues = z.infer<typeof productionOrderFieldsSchema>;

export function useProductionOrderForm(defaults?: Partial<ProductionOrderFormValues>) {
  return useForm<ProductionOrderFormValues>({
    resolver: zodResolver(productionOrderFieldsSchema),
    defaultValues: {
      orderNumber: defaults?.orderNumber ?? "",
      description: defaults?.description ?? "",
      productId: defaults?.productId ?? "",
      plannedQuantity: defaults?.plannedQuantity ?? 1,
      plannedStartTime: defaults?.plannedStartTime ?? "",
      plannedEndTime: defaults?.plannedEndTime ?? "",
      productionLocationId: defaults?.productionLocationId ?? "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
}
