"use client";

import type { ReactNode } from "react";

import { FormFieldLabel } from "@/components/forms/form-field-label";

type FormFieldProps = {
  id?: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
};

export function FormField({ id, label, required, optional, hint, error, children }: FormFieldProps) {
  return (
    <div className="grid gap-2">
      <FormFieldLabel htmlFor={id} required={required} optional={optional}>
        {label}
      </FormFieldLabel>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
