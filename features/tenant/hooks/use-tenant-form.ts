"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const tenantFieldsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  gcp: z.string().optional(),
});

export type TenantFormValues = z.infer<typeof tenantFieldsSchema>;

export function useTenantForm(defaults?: Partial<TenantFormValues>) {
  return useForm<TenantFormValues>({
    resolver: zodResolver(tenantFieldsSchema),
    defaultValues: {
      name: defaults?.name ?? "",
      gcp: defaults?.gcp ?? "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
}
