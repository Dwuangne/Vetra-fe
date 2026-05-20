"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const partyFieldsSchema = z.object({
  gln: z.string(),
  name: z.string().trim().min(1, "Name is required"),
  taxCode: z
    .string()
    .refine((value) => {
      const trimmed = value.trim();
      return trimmed === "" || /^\d{10}$/.test(trimmed) || /^\d{13}$/.test(trimmed);
    }, { message: "Tax code must be 10 or 13 digits" }),
  registeredAddress: z.string(),
  phone: z.string(),
  email: z
    .string()
    .refine(
      (value) => value.trim() === "" || z.string().email().safeParse(value.trim()).success,
      { message: "Invalid email address" }
    ),
});

export type PartyFormValues = z.infer<typeof partyFieldsSchema>;

export function usePartyForm(defaults?: Partial<PartyFormValues>) {
  return useForm<PartyFormValues>({
    resolver: zodResolver(partyFieldsSchema),
    defaultValues: {
      gln: defaults?.gln ?? "",
      name: defaults?.name ?? "",
      taxCode: defaults?.taxCode ?? "",
      registeredAddress: defaults?.registeredAddress ?? "",
      phone: defaults?.phone ?? "",
      email: defaults?.email ?? "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
}

export function partyFormValuesToRequest(values: PartyFormValues): {
  gln: string | null;
  name: string;
  taxCode: string | null;
  registeredAddress: string | null;
  phone: string | null;
  email: string | null;
} {
  const trimOrNull = (value: string) => {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  };

  return {
    gln: trimOrNull(values.gln),
    name: values.name.trim(),
    taxCode: trimOrNull(values.taxCode),
    registeredAddress: trimOrNull(values.registeredAddress),
    phone: trimOrNull(values.phone),
    email: trimOrNull(values.email),
  };
}
