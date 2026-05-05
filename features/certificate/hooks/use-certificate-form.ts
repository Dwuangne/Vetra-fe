"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const certificateFieldsSchema = z.object({
  productId: z.string().optional(),
  locationId: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  url: z.string().max(2000).optional(),
}).refine(
  (v) => (v.productId?.trim().length ?? 0) > 0 || (v.locationId?.trim().length ?? 0) > 0,
  {
    message: "At least one scope is required: product or location",
    path: ["productId"],
  }
);

export type CertificateFormValues = z.infer<typeof certificateFieldsSchema>;

export function useCertificateForm(defaults?: Partial<CertificateFormValues>) {
  return useForm<CertificateFormValues>({
    resolver: zodResolver(certificateFieldsSchema),
    defaultValues: {
      productId: defaults?.productId ?? "",
      locationId: defaults?.locationId ?? "",
      name: defaults?.name ?? "",
      url: defaults?.url ?? "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
}
