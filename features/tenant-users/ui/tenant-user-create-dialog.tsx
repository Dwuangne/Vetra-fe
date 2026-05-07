"use client";

import { ApiHttpError } from "@/lib/api/errors";
import { createTenantUser } from "@/lib/api/services/tenant-user.service";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { APP_ROLE } from "@/lib/auth/roles";
import { flattenApiFieldErrors, validationErrorsFromApiError } from "@/lib/forms/api-error-to-form";
import { messages, pickLocalized, useLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import { toastApiError, toastMutationSuccess } from "@/lib/ui/api-toast";
import { BRAND_PRIMARY_BUTTON_CLASS } from "@/lib/ui/brand";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

import { TENANT_USER_PASSWORD_MIN_LENGTH } from "../lib/password-rules";
import { TenantUserPasswordField } from "./tenant-user-password-field";

const CREATE_ROLES = [APP_ROLE.Supervisor, APP_ROLE.Operator] as const;

type TenantUserCreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
};

export function TenantUserCreateDialog({ open, onOpenChange, onCreated }: TenantUserCreateDialogProps) {
  const { locale } = useLocale();
  const v = messages.tenantUser.validation;
  const f = messages.tenantUser.fields;
  const d = messages.tenantUser.dialogs;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState<string>(APP_ROLE.Supervisor);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setUsername("");
    setPassword("");
    setConfirm("");
    setRole(APP_ROLE.Supervisor);
    setFieldErrors({});
    setFormError(null);
  }, [open]);

  const validate = (): boolean => {
    setFieldErrors({});
    setFormError(null);
    const next: Record<string, string> = {};
    if (!username.trim()) next.username = pickLocalized(v.usernameRequired, locale);
    if (!CREATE_ROLES.includes(role as (typeof CREATE_ROLES)[number])) next.role = pickLocalized(v.roleRequired, locale);

    const lenOk =
      password.length >= TENANT_USER_PASSWORD_MIN_LENGTH && confirm.length >= TENANT_USER_PASSWORD_MIN_LENGTH;
    if (!lenOk) {
      if (password.length < TENANT_USER_PASSWORD_MIN_LENGTH) next.password = pickLocalized(v.passwordMin, locale);
      if (confirm.length < TENANT_USER_PASSWORD_MIN_LENGTH)
        next.confirmPassword = pickLocalized(v.passwordMin, locale);
    } else if (password !== confirm) {
      next.confirmPassword = pickLocalized(v.passwordMismatch, locale);
    }

    if (Object.keys(next).length) {
      setFieldErrors(next);
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await createTenantUser({
        username: username.trim(),
        password,
        role,
      });
      toastMutationSuccess(locale);
      onCreated();
      onOpenChange(false);
    } catch (e: unknown) {
      const apiErrs = flattenApiFieldErrors(validationErrorsFromApiError(e));
      if (Object.keys(apiErrs).length) {
        setFieldErrors(apiErrs);
        return;
      }
      if (e instanceof ApiHttpError) {
        toastApiError(e, locale);
        return;
      }
      toastApiError(e, locale);
    } finally {
      setSubmitting(false);
    }
  };

  const selectClass =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{pickLocalized(d.createTitle, locale)}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="tu-create-username" className="text-sm font-medium">
              {pickLocalized(f.username, locale)}
            </label>
            <Input
              id="tu-create-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
              className={cn(fieldErrors.username && "border-destructive")}
            />
            {fieldErrors.username ? <p className="text-sm text-destructive">{fieldErrors.username}</p> : null}
          </div>

          <div className="grid gap-2">
            <label htmlFor="tu-create-role" className="text-sm font-medium">
              {pickLocalized(f.role, locale)}
            </label>
            <select
              id="tu-create-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={cn(selectClass, fieldErrors.role && "border-destructive")}
            >
              {CREATE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {tenantUserRoleSelectLabel(r, locale)}
                </option>
              ))}
            </select>
            {fieldErrors.role ? <p className="text-sm text-destructive">{fieldErrors.role}</p> : null}
          </div>

          <TenantUserPasswordField
            id="tu-create-password"
            label={pickLocalized(f.password, locale)}
            value={password}
            onChange={setPassword}
            disabled={submitting}
            invalid={!!fieldErrors.password}
          />
          {fieldErrors.password ? <p className="text-sm text-destructive">{fieldErrors.password}</p> : null}

          <div className="grid gap-2">
            <label htmlFor="tu-create-confirm" className="text-sm font-medium">
              {pickLocalized(f.confirmPassword, locale)}
            </label>
            <Input
              id="tu-create-confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={submitting}
              autoComplete="new-password"
              className={cn(fieldErrors.confirmPassword && "border-destructive")}
            />
            {fieldErrors.confirmPassword ? (
              <p className="text-sm text-destructive">{fieldErrors.confirmPassword}</p>
            ) : null}
          </div>

          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            {pickLocalized(messages.common.cancel, locale)}
          </Button>
          <Button
            type="button"
            className={BRAND_PRIMARY_BUTTON_CLASS}
            disabled={submitting}
            onClick={() => void submit()}
          >
            {pickLocalized(messages.tenantUser.actions.create, locale)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function tenantUserRoleSelectLabel(role: string, locale: Locale): string {
  if (role === APP_ROLE.Supervisor) return pickLocalized(messages.tenantUser.roles.Supervisor, locale);
  if (role === APP_ROLE.Operator) return pickLocalized(messages.tenantUser.roles.Operator, locale);
  return role;
}
