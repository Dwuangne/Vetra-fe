"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const partyFieldsSchema = z.object({
  gln: z.string().min(1, "GLN is required"),
  name: z.string().min(1, "Name is required"),
});

export type PartyFormValues = z.infer<typeof partyFieldsSchema>;

export function usePartyForm(defaults?: Partial<PartyFormValues>) {
  return useForm<PartyFormValues>({
    resolver: zodResolver(partyFieldsSchema),
    defaultValues: {
      gln: defaults?.gln ?? "",
      name: defaults?.name ?? "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
}
