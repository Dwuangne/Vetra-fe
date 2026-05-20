"use client";

import { Controller } from "react-hook-form";
import { useMemo, useEffect } from "react";

import { FormField } from "@/components/forms/form-field";
import { optionalFieldPlaceholder } from "@/components/forms/form-field-label";
import { EntitySelect } from "@/components/forms/entity-select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { LocationDto } from "@/lib/api/types/location";
import { listParties } from "@/lib/api/services/party.service";
import { createLocation, updateLocation } from "@/lib/api/services/location.service";
import { useAuth } from "@/features/auth";
import {
  applyApiValidationErrors,
  validationErrorsFromApiError,
} from "@/lib/forms/api-error-to-form";
import { messages, pickLocalized, useLocale } from "@/lib/i18n";
import { toastApiError, toastMutationSuccess } from "@/lib/ui/api-toast";
import { cn } from "@/lib/utils";

import type { LocationFormValues } from "../hooks/use-location-form";
import { useLocationForm } from "../hooks/use-location-form";

type LocationFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: LocationDto | null;
  onSaved: () => void;
};

export function LocationFormDialog({ open, onOpenChange, editing, onSaved }: LocationFormDialogProps) {
  const { locale } = useLocale();
  const { user } = useAuth();
  const tenantId = user?.tenantId?.trim() || undefined;
  const form = useLocationForm();
  const {
    register,
    control,
    handleSubmit,
    reset,
    clearErrors,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    if (!open) return;

    reset(
      editing
        ? {
            gln: editing.gln,
            extension: editing.extension ?? "",
            partyId: editing.partyId ?? "",
            name: editing.name,
            address: editing.address ?? "",
          }
        : { gln: "", extension: "", partyId: "", name: "", address: "" }
    );
    clearErrors();
  }, [open, editing, reset, clearErrors]);

  const loadPartyOptions = useMemo(
    () => async (query: string) => {
      const res = await listParties({ keyword: query || undefined, page: 1, size: 50, tenantId });
      return (res.data?.items ?? []).map((item) => ({
        value: item.partyId,
        label: `${item.name} (${item.gln})`,
      }));
    },
    [tenantId]
  );

  const title = editing
    ? pickLocalized(messages.location.actions.update, locale)
    : pickLocalized(messages.location.actions.create, locale);
  const f = messages.location.fields;
  const cancelLabel = pickLocalized(messages.common.cancel, locale);
  const partyLabel = pickLocalized(f.partyId, locale);

  const onSubmit = handleSubmit(async (values: LocationFormValues) => {
    clearErrors();
    const partyId =
      typeof values.partyId === "string" && values.partyId.trim().length > 0
        ? values.partyId.trim()
        : null;
    const extRaw = values.extension?.trim();
    const addrRaw = values.address?.trim();
    const payload = {
      gln: values.gln,
      extension: extRaw?.length ? extRaw : null,
      partyId,
      name: values.name,
      address: addrRaw?.length ? addrRaw : null,
    };

    try {
      if (editing) {
        await updateLocation(editing.locationId, payload);
      } else {
        await createLocation(payload);
      }
      toastMutationSuccess(locale);
      onSaved();
      onOpenChange(false);
    } catch (e: unknown) {
      const fieldCount = applyApiValidationErrors(validationErrorsFromApiError(e), setError);
      if (fieldCount === 0) {
        toastApiError(e, locale);
      }
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4">
          <FormField
            id="location-gln"
            label={pickLocalized(f.gln, locale)}
            required
            error={errors.gln?.message}
          >
            <Input
              id="location-gln"
              {...register("gln")}
              aria-required
              className={cn(errors.gln && "border-destructive")}
              autoComplete="off"
            />
          </FormField>
          <FormField id="location-extension" label={pickLocalized(f.extension, locale)} optional>
            <Input id="location-extension" {...register("extension")} autoComplete="off" />
          </FormField>
          <FormField
            id="location-name"
            label={pickLocalized(f.name, locale)}
            required
            error={errors.name?.message}
          >
            <Input
              id="location-name"
              {...register("name")}
              aria-required
              className={cn(errors.name && "border-destructive")}
              autoComplete="off"
            />
          </FormField>
          <FormField id="location-address" label={pickLocalized(f.address, locale)} optional error={errors.address?.message}>
            <textarea
              id="location-address"
              {...register("address")}
              rows={3}
              className={cn(
                "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                errors.address && "border-destructive"
              )}
              autoComplete="street-address"
            />
          </FormField>
          <FormField id="location-party" label={partyLabel} optional error={errors.partyId?.message}>
            <Controller
              control={control}
              name="partyId"
              render={({ field }) => (
                <EntitySelect
                  value={field.value?.trim() ? field.value : null}
                  onValueChange={(value) => setValue("partyId", value ?? "", { shouldValidate: true })}
                  loadOptions={loadPartyOptions}
                  placeholder={optionalFieldPlaceholder(partyLabel, locale)}
                  searchPlaceholder={partyLabel}
                  disabled={isSubmitting}
                  className={cn(errors.partyId && "rounded-md border border-destructive")}
                />
              )}
            />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {cancelLabel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {title}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
