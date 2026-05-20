"use client";

import type { ReactNode } from "react";

import { messages, pickLocalized, useLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

type FormFieldLabelProps = {
  htmlFor?: string;
  children: ReactNode;
  required?: boolean;
  optional?: boolean;
  className?: string;
};

export function FormFieldLabel({ htmlFor, children, required, optional, className }: FormFieldLabelProps) {
  const { locale } = useLocale();
  const requiredMark = pickLocalized(messages.common.requiredMark, locale);
  const optionalLabel = pickLocalized(messages.common.optional, locale);

  return (
    <label htmlFor={htmlFor} className={cn("text-sm font-medium", className)}>
      {children}
      {required ? (
        <>
          <span className="text-destructive" aria-hidden="true">
            {" *"}
          </span>
          <span className="sr-only"> ({requiredMark})</span>
        </>
      ) : null}
      {optional ? (
        <span className="font-normal text-muted-foreground"> ({optionalLabel})</span>
      ) : null}
    </label>
  );
}

/** Appends localized "(optional)" for EntitySelect and similar placeholders. */
export function optionalFieldPlaceholder(label: string, locale: Locale): string {
  const optionalLabel = pickLocalized(messages.common.optional, locale);
  return `${label} (${optionalLabel})`;
}
