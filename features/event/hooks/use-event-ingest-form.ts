"use client";



import { zodResolver } from "@hookform/resolvers/zod";

import { useCallback, useEffect, useState } from "react";

import { useForm } from "react-hook-form";

import type { UseFormSetError } from "react-hook-form";

import * as z from "zod";



import { listFormFields } from "@/lib/api/services/form-field.service";

import { listFormTemplates } from "@/lib/api/services/form-template.service";

import type { AttributeDataType } from "@/lib/api/types/attribute-definition";

import type { IngestEventAttributeRequest, IngestEventRequest } from "@/lib/api/types/event";

import type { FormFieldDto } from "@/lib/api/types/form-template";

import { EPCIS_EVENT_TYPES } from "@/lib/production/epcis-constants";



const manualAttributeRowSchema = z.object({

  attrId: z.string(),

  dataType: z.enum(["STRING", "NUMERIC", "DATE", "BOOLEAN"]).optional(),

  value: z.string(),

});



export const eventIngestFormSchema = z

  .object({

    eventTime: z.string().min(1, "Event time is required"),

    timezoneOffset: z

      .string()

      .regex(/^[+-]\d{2}:\d{2}$/, "Timezone offset must be like +07:00"),

    eventType: z.enum(EPCIS_EVENT_TYPES),

    bizStep: z.string().optional(),

    readPointId: z.string().optional(),

    anchorProductionOrderId: z.string().optional(),

    anchorBatchId: z.string().optional(),

    templateAttributeValues: z.record(z.string(), z.string()),

    manualAttributes: z.array(manualAttributeRowSchema),

  })

  .superRefine((data, ctx) => {

    if (!data.bizStep?.trim()) {

      ctx.addIssue({

        code: "custom",

        message: "Business step is required",

        path: ["bizStep"],

      });

    }



    const hasPo = Boolean(data.anchorProductionOrderId?.trim());

    const hasBatch = Boolean(data.anchorBatchId?.trim());

    if (!hasPo && !hasBatch) {

      ctx.addIssue({

        code: "custom",

        message: "Production order or batch anchor is required",

        path: ["anchorProductionOrderId"],

      });

    }

  });



export type EventIngestFormValues = z.infer<typeof eventIngestFormSchema>;



export function getDefaultTimezoneOffset(): string {

  const offsetMin = -new Date().getTimezoneOffset();

  const sign = offsetMin >= 0 ? "+" : "-";

  const abs = Math.abs(offsetMin);

  const hours = String(Math.floor(abs / 60)).padStart(2, "0");

  const minutes = String(abs % 60).padStart(2, "0");

  return `${sign}${hours}:${minutes}`;

}



export function getDefaultEventIngestValues(): EventIngestFormValues {

  return {

    eventTime: new Date().toISOString(),

    timezoneOffset: getDefaultTimezoneOffset(),

    eventType: "ObjectEvent",

    bizStep: "",

    readPointId: "",

    anchorProductionOrderId: "",

    anchorBatchId: "",

    templateAttributeValues: {},

    manualAttributes: [],

  };

}



function toOptionalGuid(value: string | undefined): string | null {

  const trimmed = value?.trim();

  return trimmed ? trimmed : null;

}



function toOptionalString(value: string | undefined): string | null {

  const trimmed = value?.trim();

  return trimmed ? trimmed : null;

}



function attributeValueToRequest(

  attrId: string,

  dataType: AttributeDataType,

  raw: string

): IngestEventAttributeRequest | null {

  const trimmed = raw.trim();

  if (!trimmed) return null;



  switch (dataType) {

    case "STRING":

      return { attrId, valString: trimmed };

    case "NUMERIC": {

      const numeric = Number(trimmed);

      if (Number.isNaN(numeric)) return null;

      return { attrId, valNumeric: numeric };

    }

    case "DATE":

      return { attrId, valTimestamp: new Date(trimmed).toISOString() };

    case "BOOLEAN":

      return { attrId, valString: trimmed === "true" ? "true" : "false" };

    default:

      return { attrId, valString: trimmed };

  }

}



export function mapEventIngestFormToRequest(

  values: EventIngestFormValues,

  templateFields: FormFieldDto[]

): IngestEventRequest {

  const attributes: IngestEventAttributeRequest[] = [];



  for (const field of templateFields) {

    const raw = values.templateAttributeValues[field.attrId] ?? "";

    const mapped = attributeValueToRequest(field.attrId, field.dataType, raw);

    if (mapped) attributes.push(mapped);

  }



  for (const row of values.manualAttributes) {

    if (!row.attrId.trim() || !row.dataType) continue;

    const mapped = attributeValueToRequest(row.attrId, row.dataType, row.value);

    if (mapped) attributes.push(mapped);

  }



  return {

    eventTime: values.eventTime,

    timezoneOffset: values.timezoneOffset,

    eventType: "ObjectEvent",

    action: "OBSERVE",

    bizStep: toOptionalString(values.bizStep),

    readPointId: toOptionalGuid(values.readPointId),

    productionOrderId: toOptionalGuid(values.anchorProductionOrderId),

    batchId: toOptionalGuid(values.anchorBatchId),

    epcs: [],

    attributes: attributes.length > 0 ? attributes : undefined,

  };

}



export function validateTemplateAttributeValues(

  templateFields: FormFieldDto[],

  values: EventIngestFormValues,

  setError: UseFormSetError<EventIngestFormValues>

): boolean {

  let valid = true;



  for (const field of templateFields) {

    if (!field.isRequired) continue;

    const raw = values.templateAttributeValues[field.attrId] ?? "";

    if (!raw.trim()) {

      setError(

        `templateAttributeValues.${field.attrId}` as `templateAttributeValues.${string}`,

        {

          type: "manual",

          message: `${field.attributeName} is required`,

        }

      );

      valid = false;

    }

  }



  return valid;

}



export function useEventIngestForm() {

  const form = useForm<EventIngestFormValues>({

    resolver: zodResolver(eventIngestFormSchema),

    defaultValues: getDefaultEventIngestValues(),

    mode: "onSubmit",

    reValidateMode: "onChange",

  });



  const [templateFields, setTemplateFields] = useState<FormFieldDto[]>([]);

  const [templateLoading, setTemplateLoading] = useState(false);

  const bizStep = form.watch("bizStep");



  const loadTemplateForBizStep = useCallback(async (step: string) => {

    const trimmed = step.trim();

    if (!trimmed) {

      setTemplateFields([]);

      return;

    }



    setTemplateLoading(true);

    try {

      const templatesRes = await listFormTemplates({ bizStep: trimmed, page: 1, size: 1 });

      const template = templatesRes.data?.items?.[0];

      if (!template) {

        setTemplateFields([]);

        return;

      }



      const fieldsRes = await listFormFields(template.templateId);

      setTemplateFields(fieldsRes.data ?? []);

    } catch {

      setTemplateFields([]);

    } finally {

      setTemplateLoading(false);

    }

  }, []);



  useEffect(() => {

    void loadTemplateForBizStep(bizStep ?? "");

  }, [bizStep, loadTemplateForBizStep]);



  useEffect(() => {

    if (templateFields.length === 0) return;

    const current = form.getValues("templateAttributeValues");

    const next: Record<string, string> = {};

    for (const field of templateFields) {

      next[field.attrId] = current[field.attrId] ?? "";

    }

    form.setValue("templateAttributeValues", next);

  }, [templateFields, form]);



  const buildRequest = useCallback(

    (values: EventIngestFormValues) => mapEventIngestFormToRequest(values, templateFields),

    [templateFields]

  );



  const validateTemplateRequired = useCallback(

    (values: EventIngestFormValues) =>

      validateTemplateAttributeValues(templateFields, values, form.setError),

    [form, templateFields]

  );



  return {

    form,

    templateFields,

    templateLoading,

    buildRequest,

    validateTemplateRequired,

  };

}

