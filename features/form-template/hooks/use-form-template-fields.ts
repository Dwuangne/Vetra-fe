"use client";



import { useCallback, useEffect, useRef, useState } from "react";



import { ApiHttpError } from "@/lib/api/errors";

import { listFormFields } from "@/lib/api/services/form-field.service";

import { getFormTemplateById } from "@/lib/api/services/form-template.service";

import type { FormFieldDto, FormTemplateDto } from "@/lib/api/types/form-template";

import { useLocale } from "@/lib/i18n";

import { resolveApiErrorMessage } from "@/lib/i18n/resolve-api-error";



export function useFormTemplateFields(templateId: string | undefined) {

  const { locale } = useLocale();

  const requestIdRef = useRef(0);



  const [template, setTemplate] = useState<FormTemplateDto | null>(null);

  const [fields, setFields] = useState<FormFieldDto[]>([]);

  const [loading, setLoading] = useState(Boolean(templateId));

  const [initialLoad, setInitialLoad] = useState(Boolean(templateId));

  const [error, setError] = useState<string | null>(null);



  const load = useCallback(async () => {

    if (!templateId) return;



    const requestId = ++requestIdRef.current;

    setLoading(true);

    setError(null);



    try {

      const [templateRes, fieldsRes] = await Promise.all([

        getFormTemplateById(templateId),

        listFormFields(templateId),

      ]);

      if (requestId !== requestIdRef.current) return;

      setTemplate(templateRes.data ?? null);

      setFields(fieldsRes.data ?? []);

    } catch (e) {

      if (requestId !== requestIdRef.current) return;

      const message =

        e instanceof ApiHttpError

          ? resolveApiErrorMessage(e, locale)

          : e instanceof Error

            ? e.message

            : "Request failed";

      setError(message);

      setTemplate(null);

      setFields([]);

    } finally {

      if (requestId === requestIdRef.current) {

        setLoading(false);

        setInitialLoad(false);

      }

    }

  }, [templateId, locale]);



  const reload = useCallback(() => {

    void load();

  }, [load]);



  useEffect(() => {

    if (!templateId) {

      requestIdRef.current += 1;

      const id = window.setTimeout(() => {

        setTemplate(null);

        setFields([]);

        setError(null);

        setLoading(false);

        setInitialLoad(false);

      }, 0);

      return () => window.clearTimeout(id);

    }



    const id = window.setTimeout(() => {

      void load();

    }, 0);



    return () => {

      window.clearTimeout(id);

      requestIdRef.current += 1;

    };

  }, [templateId, load]);



  return {

    template,

    fields,

    loading,

    initialLoad,

    error,

    reload,

  };

}

