"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const locationFieldsSchema = z.object({
  gln: z.string(),
  extension: z.string().optional(),
  partyId: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  address: z.string().max(500).optional(),
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
      address: defaults?.address ?? "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
}

export function locationFormValuesToRequest(values: LocationFormValues): {
  gln: string | null;
  extension: string | null;
  partyId: string | null;
  name: string;
  address: string | null;
} {
  const trimOrNull = (value: string) => {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  };

  const extRaw = values.extension?.trim();
  const addrRaw = values.address?.trim();

  return {
    gln: trimOrNull(values.gln),
    extension: extRaw?.length ? extRaw : null,
    partyId:
      typeof values.partyId === "string" && values.partyId.trim().length > 0
        ? values.partyId.trim()
        : null,
    name: values.name.trim(),
    address: addrRaw?.length ? addrRaw : null,
  };
}
