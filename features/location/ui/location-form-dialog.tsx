"use client";

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
import type { PartyDto } from "@/lib/api/types/party";
import { useAuth } from "@/features/auth";
import {
  applyApiValidationErrors,
  validationErrorsFromApiError,
} from "@/lib/forms/api-error-to-form";
import { messages, pickLocalized, useLocale } from "@/lib/i18n";
import { toastApiError, toastMutationSuccess } from "@/lib/ui/api-toast";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

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
    handleSubmit,
    reset,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = form;

  const [parties, setParties] = useState<PartyDto[]>([]);
  const [partiesError, setPartiesError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    reset(
      editing
        ? {
            gln: editing.gln,
            extension: editing.extension ?? "",
            partyId: editing.partyId ?? "",
            name: editing.name,
          }
        : { gln: "", extension: "", partyId: "", name: "" }
    );
    clearErrors();

    let cancelled = false;
    void (async () => {
      try {
        const res = await listParties({ page: 1, size: 200, tenantId });
        if (!cancelled) {
          setParties(res.data?.items ?? []);
          setPartiesError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setParties([]);
          setPartiesError(e instanceof Error ? e.message : "Failed to load parties");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, editing, reset, clearErrors, tenantId]);

  const title = editing
    ? pickLocalized(messages.location.actions.update, locale)
    : pickLocalized(messages.location.actions.create, locale);
  const f = messages.location.fields;

  const onSubmit = handleSubmit(async (values: LocationFormValues) => {
    clearErrors();
    const partyId =
      typeof values.partyId === "string" && values.partyId.trim().length > 0
        ? values.partyId.trim()
        : null;
    const extRaw = values.extension?.trim();
    const payload = {
      gln: values.gln,
      extension: extRaw?.length ? extRaw : null,
      partyId,
      name: values.name,
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

  const partyPlaceholder = pickLocalized(f.partyId, locale);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="location-gln" className="text-sm font-medium">
              {pickLocalized(f.gln, locale)}
            </label>
            <Input
              id="location-gln"
              {...register("gln")}
              className={cn(errors.gln && "border-destructive")}
              autoComplete="off"
            />
            {errors.gln?.message ? (
              <p className="text-sm text-destructive">{String(errors.gln.message)}</p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <label htmlFor="location-extension" className="text-sm font-medium">
              {pickLocalized(f.extension, locale)}
            </label>
            <Input id="location-extension" {...register("extension")} autoComplete="off" />
          </div>
          <div className="grid gap-2">
            <label htmlFor="location-name" className="text-sm font-medium">
              {pickLocalized(f.name, locale)}
            </label>
            <Input
              id="location-name"
              {...register("name")}
              className={cn(errors.name && "border-destructive")}
              autoComplete="off"
            />
            {errors.name?.message ? (
              <p className="text-sm text-destructive">{String(errors.name.message)}</p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <label htmlFor="location-party" className="text-sm font-medium">
              {partyPlaceholder}
            </label>
            <select
              id="location-party"
              {...register("partyId")}
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                errors.partyId && "border-destructive"
              )}
            >
              <option value="">{`${partyPlaceholder} (optional)`}</option>
              {parties.map((p) => (
                <option key={p.partyId} value={p.partyId}>
                  {p.name} ({p.gln})
                </option>
              ))}
            </select>
            {partiesError ? <p className="text-xs text-destructive">{partiesError}</p> : null}
            {errors.partyId?.message ? (
              <p className="text-sm text-destructive">{String(errors.partyId.message)}</p>
            ) : null}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
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
