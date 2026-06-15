"use client";

import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray } from "react-hook-form";
import { DatetimeInput } from "@/components/forms/datetime-input";
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
import { Input } from "@/components/ui/input";
import {
  getAttributeDefinitionById,
  listAttributeDefinitions,
} from "@/lib/api/services/attribute-definition.service";
import { listBatches } from "@/lib/api/services/batch.service";
import { ingestEvent } from "@/lib/api/services/event.service";
import { listLocations } from "@/lib/api/services/location.service";
import {
  getProductionOrderById,
  listProductionOrders,
} from "@/lib/api/services/production-order.service";
import type { AttributeDataType } from "@/lib/api/types/attribute-definition";
import type { FormFieldDto } from "@/lib/api/types/form-template";
import {
  applyApiValidationErrors,
  validationErrorsFromApiError,
} from "@/lib/forms/api-error-to-form";
import { messages, pickLocalized, useLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import { getBizStepLabel, PLANT_BIZ_STEPS } from "@/lib/production/cbv-biz-steps";
import { toastApiError, toastMutationSuccess } from "@/lib/ui/api-toast";
import {

  getDefaultEventIngestValues,

  getDefaultTimezoneOffset,

  useEventIngestForm,

  type EventIngestFormValues,

} from "../hooks/use-event-ingest-form";



type EventIngestDialogProps = {

  open: boolean;

  onOpenChange: (open: boolean) => void;

  onIngested: () => void;

};



const selectClass =

  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";



type AttributeValueInputProps = {

  dataType: AttributeDataType;

  value: string;

  onChange: (value: string) => void;

  disabled?: boolean;

  id?: string;

  locale: Locale;

};



function AttributeValueInput({

  dataType,

  value,

  onChange,

  disabled,

  id,

  locale,

}: AttributeValueInputProps) {

  const booleanLabels = messages.event.ingest.attributes.booleanValue;



  switch (dataType) {

    case "NUMERIC":

      return (

        <Input

          id={id}

          type="number"

          value={value}

          onChange={(e) => onChange(e.target.value)}

          disabled={disabled}

        />

      );

    case "DATE":

      return (

        <DatetimeInput

          value={value || null}

          onValueChange={(next) => onChange(next ?? "")}

          disabled={disabled}

        />

      );

    case "BOOLEAN":

      return (

        <select

          id={id}

          className={selectClass}

          value={value || "false"}

          onChange={(e) => onChange(e.target.value)}

          disabled={disabled}

        >

          <option value="true">{pickLocalized(booleanLabels.true, locale)}</option>

          <option value="false">{pickLocalized(booleanLabels.false, locale)}</option>

        </select>

      );

    default:

      return (

        <Input

          id={id}

          value={value}

          onChange={(e) => onChange(e.target.value)}

          disabled={disabled}

        />

      );

  }

}



type TemplateAttributeFieldsProps = {

  fields: FormFieldDto[];

  values: Record<string, string>;

  errors: Record<string, { message?: string } | undefined>;

  onValueChange: (attrId: string, value: string) => void;

  disabled?: boolean;

  locale: Locale;

};



function TemplateAttributeFields({

  fields,

  values,

  errors,

  onValueChange,

  disabled,

  locale,

}: TemplateAttributeFieldsProps) {

  const ing = messages.event.ingest;



  if (fields.length === 0) return null;



  return (

    <div className="grid gap-3 sm:grid-cols-2">

      {fields.map((field) => (

        <FormField

          key={field.attrId}

          id={`template-attr-${field.attrId}`}

          label={field.attributeName}

          required={field.isRequired}

          error={errors[field.attrId]?.message}

        >

          <AttributeValueInput

            id={`template-attr-${field.attrId}`}

            dataType={field.dataType}

            value={values[field.attrId] ?? ""}

            onChange={(value) => onValueChange(field.attrId, value)}

            disabled={disabled}

            locale={locale}

          />

        </FormField>

      ))}

      <p className="text-xs text-muted-foreground sm:col-span-2">

        {pickLocalized(ing.attributes.templateHint, locale)}

      </p>

    </div>

  );

}



export function EventIngestDialog({ open, onOpenChange, onIngested }: EventIngestDialogProps) {

  const { locale } = useLocale();

  const { form, templateFields, templateLoading, buildRequest, validateTemplateRequired } =

    useEventIngestForm();



  const {

    register,

    control,

    handleSubmit,

    reset,

    clearErrors,

    setError,

    watch,

    setValue,

    formState: { errors, isSubmitting },

  } = form;



  const {

    fields: manualFields,

    append: appendManual,

    remove: removeManual,

  } = useFieldArray({ control, name: "manualAttributes" });



  const anchorProductionOrderId = watch("anchorProductionOrderId");

  const [selectedProductionOrderLabel, setSelectedProductionOrderLabel] = useState<

    string | undefined

  >();

  const templateAttributeValues = watch("templateAttributeValues") ?? {};

  const manualAttributes = watch("manualAttributes") ?? [];



  useEffect(() => {

    if (!open) return;

    reset(getDefaultEventIngestValues());

    clearErrors();

  }, [open, reset, clearErrors]);



  useEffect(() => {

    setValue("eventType", "ObjectEvent");

    setValue("timezoneOffset", getDefaultTimezoneOffset());

  }, [open, setValue]);



  const ing = messages.event.ingest;

  const cancelLabel = pickLocalized(messages.common.cancel, locale);

  const title = pickLocalized(ing.title, locale);

  const submitLabel = pickLocalized(ing.submit, locale);



  const templateFieldIds = useMemo(

    () => new Set(templateFields.map((field) => field.attrId)),

    [templateFields]

  );



  const usedManualAttrIds = useMemo(

    () => new Set(manualAttributes.map((row) => row.attrId).filter(Boolean)),

    [manualAttributes]

  );



  useEffect(() => {

    const id = anchorProductionOrderId?.trim() ?? "";

    if (!id) {

      setSelectedProductionOrderLabel(undefined);

      return;

    }



    let cancelled = false;

    void getProductionOrderById(id)

      .then((res) => {

        if (!cancelled) setSelectedProductionOrderLabel(res.data?.orderNumber);

      })

      .catch(() => {

        if (!cancelled) setSelectedProductionOrderLabel(undefined);

      });



    return () => {

      cancelled = true;

    };

  }, [anchorProductionOrderId]);



  const loadProductionOrderOptions = useMemo(

    () => async (query: string) => {

      const res = await listProductionOrders({

        keyword: query.trim() || undefined,

        page: 1,

        size: 50,

      });

      return (res.data?.items ?? []).map((item) => ({

        value: item.productionOrderId,

        label: item.orderNumber,

      }));

    },

    []

  );



  const loadAnchorBatchOptions = useMemo(

    () => async (query: string) => {

      const res = await listBatches({

        keyword: query || undefined,

        productionOrderId: anchorProductionOrderId?.trim() || undefined,

        page: 1,

        size: 50,

      });

      return (res.data?.items ?? []).map((b) => ({

        value: b.batchId,

        label: b.lotNumber,

      }));

    },

    [anchorProductionOrderId]

  );



  const loadLocationOptions = useMemo(

    () => async (query: string) => {

      const res = await listLocations({ keyword: query || undefined, page: 1, size: 50 });

      return (res.data?.items ?? []).map((l) => ({

        value: l.locationId,

        label: l.name || l.gln || l.locationId,

      }));

    },

    []

  );



  const loadManualAttributeOptions = useMemo(

    () => async (query: string) => {

      const res = await listAttributeDefinitions({ keyword: query || undefined, page: 1, size: 50 });

      return (res.data?.items ?? [])

        .filter((item) => !templateFieldIds.has(item.attrId) && !usedManualAttrIds.has(item.attrId))

        .map((item) => ({ value: item.attrId, label: item.name }));

    },

    [templateFieldIds, usedManualAttrIds]

  );



  const onSubmit = handleSubmit(async (values: EventIngestFormValues) => {

    clearErrors();

    if (!validateTemplateRequired(values)) return;



    try {

      await ingestEvent(buildRequest(values));

      toastMutationSuccess(locale);

      onOpenChange(false);

      onIngested();

    } catch (e) {

      const fieldErrors = validationErrorsFromApiError(e);

      if (fieldErrors) {

        applyApiValidationErrors(fieldErrors, setError);

      } else {

        toastApiError(e, locale);

      }

    }

  });



  const templateAttrErrors = useMemo(() => {

    const root = errors.templateAttributeValues;

    if (!root || typeof root !== "object") return {};

    return root as Record<string, { message?: string }>;

  }, [errors.templateAttributeValues]);



  return (

    <Dialog open={open} onOpenChange={onOpenChange}>

      <DialogContent className="max-w-3xl sm:max-w-3xl" aria-describedby={undefined}>

        <DialogHeader>

          <DialogTitle>{title}</DialogTitle>

        </DialogHeader>



        <form onSubmit={(event) => void onSubmit(event)} className="flex flex-col gap-5">

          <section>

            <h3 className="text-sm font-medium">{pickLocalized(ing.sections.anchors, locale)}</h3>

            <p className="mb-3 text-xs text-muted-foreground">

              {pickLocalized(ing.anchors.batchHint, locale)}

            </p>

            <div className="grid gap-3 sm:grid-cols-2">

              <FormField

                id="event-ingest-anchor-po"

                label={pickLocalized(ing.anchors.productionOrder, locale)}

                optional

                error={errors.anchorProductionOrderId?.message}

              >

                <Controller

                  name="anchorProductionOrderId"

                  control={control}

                  render={({ field }) => (

                    <EntitySelect

                      value={field.value || null}

                      onValueChange={(id) => {

                        field.onChange(id ?? "");

                        setValue("anchorBatchId", "");

                      }}

                      loadOptions={loadProductionOrderOptions}

                      selectedLabel={selectedProductionOrderLabel}

                      placeholder={pickLocalized(ing.anchors.productionOrderPlaceholder, locale)}

                      disabled={isSubmitting}

                    />

                  )}

                />

              </FormField>



              <FormField

                id="event-ingest-anchor-batch"

                label={pickLocalized(ing.anchors.batch, locale)}

                optional

                error={errors.anchorBatchId?.message}

              >

                <Controller

                  name="anchorBatchId"

                  control={control}

                  render={({ field }) => (

                    <EntitySelect

                      value={field.value || null}

                      onValueChange={(id) => field.onChange(id ?? "")}

                      loadOptions={loadAnchorBatchOptions}

                      placeholder={pickLocalized(ing.anchors.batchPlaceholder, locale)}

                      disabled={isSubmitting}

                    />

                  )}

                />

              </FormField>

            </div>

          </section>



          <section>

            <input type="hidden" {...register("timezoneOffset")} />

            <input type="hidden" {...register("eventType")} />

            <div className="grid gap-3 sm:grid-cols-2">

              <FormField

                id="event-ingest-time"

                label={pickLocalized(ing.fields.eventTime, locale)}

                required

                error={errors.eventTime?.message}

              >

                <Controller

                  name="eventTime"

                  control={control}

                  render={({ field }) => (

                    <DatetimeInput

                      value={field.value || null}

                      onValueChange={(value) => field.onChange(value ?? "")}

                      disabled={isSubmitting}

                    />

                  )}

                />

              </FormField>



              <FormField

                id="event-ingest-biz-step"

                label={pickLocalized(ing.fields.bizStep, locale)}

                required

                error={errors.bizStep?.message}

              >

                <select

                  id="event-ingest-biz-step"

                  className={selectClass}

                  {...register("bizStep")}

                  disabled={isSubmitting}

                >

                  <option value="">{pickLocalized(ing.fields.none, locale)}</option>

                  {PLANT_BIZ_STEPS.map((step) => (

                    <option key={step} value={step}>

                      {getBizStepLabel(step, locale)}

                    </option>

                  ))}

                </select>

              </FormField>

            </div>

          </section>



          <section>

            <FormField

              id="event-ingest-read-point"

              label={pickLocalized(ing.fields.readPoint, locale)}

              optional

              error={errors.readPointId?.message}

            >

              <Controller

                name="readPointId"

                control={control}

                render={({ field }) => (

                  <EntitySelect

                    value={field.value || null}

                    onValueChange={(id) => field.onChange(id ?? "")}

                    loadOptions={loadLocationOptions}

                    placeholder={pickLocalized(ing.fields.readPointPlaceholder, locale)}

                    disabled={isSubmitting}

                  />

                )}

              />

            </FormField>

          </section>



          <section>

            <h3 className="mb-3 text-sm font-medium">

              {pickLocalized(ing.sections.attributes, locale)}

            </h3>



            {templateLoading ? (

              <p className="text-sm text-muted-foreground">

                {pickLocalized(ing.attributes.loadingTemplate, locale)}

              </p>

            ) : null}



            {!templateLoading && templateFields.length > 0 ? (

              <div className="mb-4">

                <p className="mb-2 text-xs font-medium text-muted-foreground">

                  {pickLocalized(ing.attributes.templateSection, locale)}

                </p>

                <TemplateAttributeFields

                  fields={templateFields}

                  values={templateAttributeValues}

                  errors={templateAttrErrors}

                  onValueChange={(attrId, value) => {

                    setValue(`templateAttributeValues.${attrId}`, value, { shouldValidate: true });

                  }}

                  disabled={isSubmitting}

                  locale={locale}

                />

              </div>

            ) : null}



            {!templateLoading && watch("bizStep") && templateFields.length === 0 ? (

              <p className="mb-4 text-sm text-muted-foreground">

                {pickLocalized(ing.attributes.noTemplate, locale)}

              </p>

            ) : null}



            <p className="mb-2 text-xs font-medium text-muted-foreground">

              {pickLocalized(ing.attributes.manualSection, locale)}

            </p>



            <div className="flex flex-col gap-3">

              {manualFields.map((row, index) => (

                <div

                  key={row.id}

                  className="grid gap-3 rounded-md border p-3 sm:grid-cols-[1fr_1fr_auto]"

                >

                  <FormField

                    label={pickLocalized(ing.attributes.attribute, locale)}

                    error={errors.manualAttributes?.[index]?.attrId?.message}

                  >

                    <Controller

                      name={`manualAttributes.${index}.attrId`}

                      control={control}

                      render={({ field }) => (

                        <EntitySelect

                          value={field.value || null}

                          onValueChange={async (id) => {

                            field.onChange(id ?? "");

                            if (!id) {

                              setValue(`manualAttributes.${index}.dataType`, undefined);

                              return;

                            }

                            try {

                              const res = await getAttributeDefinitionById(id);

                              if (res.data) {

                                setValue(`manualAttributes.${index}.dataType`, res.data.dataType);

                              }

                            } catch {

                              setValue(`manualAttributes.${index}.dataType`, undefined);

                            }

                          }}

                          loadOptions={loadManualAttributeOptions}

                          placeholder={pickLocalized(ing.attributes.attributePlaceholder, locale)}

                          disabled={isSubmitting}

                        />

                      )}

                    />

                  </FormField>



                  <FormField

                    label={pickLocalized(ing.attributes.value, locale)}

                    error={errors.manualAttributes?.[index]?.value?.message}

                  >

                    <Controller

                      name={`manualAttributes.${index}`}

                      control={control}

                      render={({ field }) => {

                        const dataType = field.value.dataType ?? "STRING";

                        return (

                          <AttributeValueInput

                            dataType={dataType}

                            value={field.value.value}

                            onChange={(value) =>

                              setValue(`manualAttributes.${index}.value`, value, {

                                shouldValidate: true,

                              })

                            }

                            disabled={isSubmitting || !field.value.attrId}

                            locale={locale}

                          />

                        );

                      }}

                    />

                  </FormField>



                  <div className="flex items-end">

                    <Button

                      type="button"

                      variant="outline"

                      size="icon"

                      onClick={() => removeManual(index)}

                      disabled={isSubmitting}

                      aria-label={pickLocalized(ing.attributes.removeRow, locale)}

                    >

                      <Trash2 className="h-4 w-4" />

                    </Button>

                  </div>

                </div>

              ))}

            </div>



            <Button

              type="button"

              variant="outline"

              size="sm"

              className="mt-3"

              onClick={() => appendManual({ attrId: "", dataType: undefined, value: "" })}

              disabled={isSubmitting}

            >

              <Plus className="mr-2 h-4 w-4" />

              {pickLocalized(ing.attributes.addRow, locale)}

            </Button>

          </section>



          <DialogFooter>

            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>

              {cancelLabel}

            </Button>

            <Button type="submit" disabled={isSubmitting}>

              {submitLabel}

            </Button>

          </DialogFooter>

        </form>

      </DialogContent>

    </Dialog>

  );

}

