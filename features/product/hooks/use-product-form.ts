"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const productFieldsSchema = z.object({
  gtin: z.string().min(1, "GTIN is required"),
  name: z.string().min(1, "Name is required"),
  imageUrl: z.string().min(1, "Image URL is required"),
  description: z.string().max(20000).optional(),
});

export type ProductFormValues = z.infer<typeof productFieldsSchema>;

export function useProductForm(defaults?: Partial<ProductFormValues>) {
  return useForm<ProductFormValues>({
    resolver: zodResolver(productFieldsSchema),
    defaultValues: {
      gtin: defaults?.gtin ?? "",
      name: defaults?.name ?? "",
      imageUrl: defaults?.imageUrl ?? "",
      description: defaults?.description ?? "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
}
