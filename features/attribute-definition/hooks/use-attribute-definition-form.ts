"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { ATTRIBUTE_DATA_TYPES } from "@/lib/production/attribute-data-types";

const attributeDefinitionFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200, "Name must be at most 200 characters"),
  dataType: z.enum(ATTRIBUTE_DATA_TYPES, { message: "Data type is required" }),
});

export type AttributeDefinitionFormValues = z.infer<typeof attributeDefinitionFormSchema>;

export function useAttributeDefinitionForm(defaults?: Partial<AttributeDefinitionFormValues>) {
  return useForm<AttributeDefinitionFormValues>({
    resolver: zodResolver(attributeDefinitionFormSchema),
    defaultValues: {
      name: defaults?.name ?? "",
      dataType: defaults?.dataType ?? "STRING",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
}
