"use client";



import { useMemo, useState } from "react";



import { EntitySelect } from "@/components/forms/entity-select";

import { FormField } from "@/components/forms/form-field";

import { Button } from "@/components/ui/button";

import {

  Dialog,

  DialogContent,

  DialogFooter,

  DialogHeader,

  DialogTitle,

} from "@/components/ui/dialog";

import { listAttributeDefinitions } from "@/lib/api/services/attribute-definition.service";

import { upsertFormField } from "@/lib/api/services/form-field.service";

import type { FormFieldDto } from "@/lib/api/types/form-template";

import { messages, pickLocalized, useLocale } from "@/lib/i18n";

import { toastApiError, toastMutationSuccess } from "@/lib/ui/api-toast";

import { cn } from "@/lib/utils";



type FormFieldUpsertDialogProps = {

  open: boolean;

  onOpenChange: (open: boolean) => void;

  templateId: string;

  existingFields: FormFieldDto[];

  onSaved: () => void;

};



export function FormFieldUpsertDialog({

  open,

  onOpenChange,

  templateId,

  existingFields,

  onSaved,

}: FormFieldUpsertDialogProps) {

  const { locale } = useLocale();

  const [attrId, setAttrId] = useState<string | null>(null);

  const [isRequired, setIsRequired] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [attrError, setAttrError] = useState<string | null>(null);



  const assignedAttrIds = useMemo(

    () => new Set(existingFields.map((field) => field.attrId)),

    [existingFields]

  );



  const loadAttributeOptions = useMemo(

    () => async (query: string) => {

      const res = await listAttributeDefinitions({ keyword: query || undefined, page: 1, size: 50 });

      return (res.data?.items ?? [])

        .filter((item) => !assignedAttrIds.has(item.attrId))

        .map((item) => ({ value: item.attrId, label: item.name }));

    },

    [assignedAttrIds]

  );



  const reset = () => {

    setAttrId(null);

    setIsRequired(false);

    setAttrError(null);

    setSubmitting(false);

  };



  const handleOpenChange = (next: boolean) => {

    if (!next) reset();

    onOpenChange(next);

  };



  const title = pickLocalized(messages.formField.upsert.title, locale);

  const cancelLabel = pickLocalized(messages.common.cancel, locale);

  const attributeLabel = pickLocalized(messages.formField.upsert.selectAttribute, locale);

  const requiredLabel = pickLocalized(messages.formField.fields.isRequired, locale);

  const requiredHint = pickLocalized(messages.formField.upsert.requiredHint, locale);

  const attrRequiredError = pickLocalized(messages.formField.upsert.attributeRequired, locale);



  const onSubmit = async (event: React.FormEvent) => {

    event.preventDefault();

    if (!attrId) {

      setAttrError(attrRequiredError);

      return;

    }



    setSubmitting(true);

    try {

      await upsertFormField(templateId, { attrId, isRequired });

      toastMutationSuccess(locale);

      handleOpenChange(false);

      onSaved();

    } catch (e) {

      toastApiError(e, locale);

    } finally {

      setSubmitting(false);

    }

  };



  return (

    <Dialog open={open} onOpenChange={handleOpenChange}>

      <DialogContent className="sm:max-w-xl" aria-describedby={undefined}>

        <DialogHeader>

          <DialogTitle>{title}</DialogTitle>

        </DialogHeader>

        <form onSubmit={(event) => void onSubmit(event)} className="grid gap-4">

          <FormField

            id="form-field-attribute"

            label={attributeLabel}

            required

            error={attrError ?? undefined}

          >

            <EntitySelect

              value={attrId}

              onValueChange={(value) => {

                setAttrId(value);

                if (value) setAttrError(null);

              }}

              loadOptions={loadAttributeOptions}

              placeholder={pickLocalized(messages.formField.upsert.attributePlaceholder, locale)}

              emptyText={pickLocalized(messages.formField.upsert.attributeEmpty, locale)}

              disabled={submitting}

              className={cn(attrError && "[&_input]:border-destructive")}

            />

          </FormField>

          <label className="flex cursor-pointer items-start gap-3 rounded-md border p-3">

            <input

              type="checkbox"

              className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-input"

              checked={isRequired}

              onChange={(e) => setIsRequired(e.target.checked)}

              disabled={submitting}

            />

            <span className="grid gap-1">

              <span className="text-sm font-medium leading-none">{requiredLabel}</span>

              <span className="text-sm text-muted-foreground">{requiredHint}</span>

            </span>

          </label>

          <DialogFooter>

            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>

              {cancelLabel}

            </Button>

            <Button type="submit" disabled={submitting}>

              {title}

            </Button>

          </DialogFooter>

        </form>

      </DialogContent>

    </Dialog>

  );

}

