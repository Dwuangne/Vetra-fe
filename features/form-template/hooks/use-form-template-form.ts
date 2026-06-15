"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { ALL_BIZ_STEPS } from "@/lib/production/cbv-biz-steps";

const formTemplateFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200, "Name must be at most 200 characters"),
  bizStep: z.enum(ALL_BIZ_STEPS, { message: "Business step is required" }),
});

export type FormTemplateFormValues = z.infer<typeof formTemplateFormSchema>;

export function useFormTemplateForm(defaults?: Partial<FormTemplateFormValues>) {
  return useForm<FormTemplateFormValues>({
    resolver: zodResolver(formTemplateFormSchema),
    defaultValues: {
      name: defaults?.name ?? "",
      bizStep: defaults?.bizStep ?? "urn:epcglobal:cbv:bizstep:commissioning",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
}
