"use client";

import { changeOwnPassword } from "@/lib/api/services/auth.service";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TenantUserPasswordField } from "@/features/tenant-users/ui/tenant-user-password-field";
import { TENANT_USER_PASSWORD_MIN_LENGTH } from "@/features/tenant-users/lib/password-rules";
import { messages, pickLocalized, useLocale } from "@/lib/i18n";
import { toast } from "@/hooks/use-toast";
import { translateCommon } from "@/lib/i18n/translate";
import { toastApiError } from "@/lib/ui/api-toast";
import { BRAND_PRIMARY_BUTTON_CLASS } from "@/lib/ui/brand";
import { useEffect, useState } from "react";

type ChangePasswordDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const { locale } = useLocale();
  const a = messages.account.changePassword;
  const vTenant = messages.tenantUser.validation;
  const f = messages.tenantUser.fields;
  const av = messages.account.changePassword.validation;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCurrentPassword("");
    setNewPassword("");
    setConfirm("");
    setFieldErrors({});
  }, [open]);

  const validate = (): boolean => {
    setFieldErrors({});
    const next: Record<string, string> = {};
    if (!currentPassword) {
      next.currentPassword = pickLocalized(av.currentRequired, locale);
    }
    const lenOk =
      newPassword.length >= TENANT_USER_PASSWORD_MIN_LENGTH &&
      confirm.length >= TENANT_USER_PASSWORD_MIN_LENGTH;
    if (!lenOk) {
      if (newPassword.length < TENANT_USER_PASSWORD_MIN_LENGTH) {
        next.newPassword = pickLocalized(vTenant.passwordMin, locale);
      }
      if (confirm.length < TENANT_USER_PASSWORD_MIN_LENGTH) {
        next.confirmPassword = pickLocalized(vTenant.passwordMin, locale);
      }
    } else if (newPassword !== confirm) {
      next.confirmPassword = pickLocalized(vTenant.passwordMismatch, locale);
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
      await changeOwnPassword({ currentPassword, newPassword });
      toast({
        title: translateCommon("changesSaved", locale),
        description: pickLocalized(a.successHint, locale),
      });
      onOpenChange(false);
    } catch (e: unknown) {
      toastApiError(e, locale);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{pickLocalized(a.title, locale)}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <TenantUserPasswordField
            id="cp-current"
            label={pickLocalized(a.currentPassword, locale)}
            value={currentPassword}
            onChange={setCurrentPassword}
            disabled={submitting}
            autoComplete="current-password"
            invalid={!!fieldErrors.currentPassword}
            required
          />
          {fieldErrors.currentPassword ? (
            <p className="-mt-2 text-sm text-destructive">{fieldErrors.currentPassword}</p>
          ) : null}

          <TenantUserPasswordField
            id="cp-new"
            label={pickLocalized(f.newPassword, locale)}
            value={newPassword}
            onChange={setNewPassword}
            disabled={submitting}
            autoComplete="new-password"
            invalid={!!fieldErrors.newPassword}
            required
          />
          {fieldErrors.newPassword ? (
            <p className="-mt-2 text-sm text-destructive">{fieldErrors.newPassword}</p>
          ) : null}

          <TenantUserPasswordField
            id="cp-confirm"
            label={pickLocalized(f.confirmPassword, locale)}
            value={confirm}
            onChange={setConfirm}
            disabled={submitting}
            autoComplete="new-password"
            invalid={!!fieldErrors.confirmPassword}
            required
          />
          {fieldErrors.confirmPassword ? (
            <p className="-mt-2 text-sm text-destructive">{fieldErrors.confirmPassword}</p>
          ) : null}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            {pickLocalized(a.cancel, locale)}
          </Button>
          <Button
            type="button"
            className={BRAND_PRIMARY_BUTTON_CLASS}
            disabled={submitting}
            onClick={() => void submit()}
          >
            {pickLocalized(a.save, locale)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
