"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const locationFieldsSchema = z.object({
  gln: z.string().min(1, "GLN is required"),
  extension: z.string().optional(),
  partyId: z.string().optional(),
  name: z.string().min(1, "Name is required"),
});

export type LocationFormValues = z.infer<typeof locationFieldsSchema>;

export function useLocationForm(defaults?: Partial<LocationFormValues>) {
  return useForm<LocationFormValues>({
    resolver: zodResolver(locationFieldsSchema),
    defaultValues: {
      gln: defaults?.gln ?? "",
      extension: defaults?.extension ?? "",
      partyId: defaults?.partyId ?? "",
      name: defaults?.name ?? "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
}
