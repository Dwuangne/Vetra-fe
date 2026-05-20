"use client";

import { FormFieldLabel } from "@/components/forms/form-field-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconEye, IconEyeOff } from "@/features/auth/ui/login-icons";
import { messages, pickLocalized, useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useState } from "react";

type TenantUserPasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoComplete?: string;
  invalid?: boolean;
  required?: boolean;
};

export function TenantUserPasswordField({
  id,
  label,
  value,
  onChange,
  disabled,
  autoComplete = "new-password",
  invalid,
  required = false,
}: TenantUserPasswordFieldProps) {
  const { locale } = useLocale();
  const a11y = messages.tenantUser.a11y;
  const [show, setShow] = useState(false);

  return (
    <div className="grid gap-2">
      <FormFieldLabel htmlFor={id} required={required}>
        {label}
      </FormFieldLabel>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-required={required || undefined}
          className={cn("pr-10", invalid && "border-destructive")}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0.5 top-0.5 h-9 w-9 text-muted-foreground hover:text-foreground"
          aria-label={show ? pickLocalized(a11y.hidePassword, locale) : pickLocalized(a11y.showPassword, locale)}
          disabled={disabled}
          onClick={() => setShow((v) => !v)}
        >
          {show ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
