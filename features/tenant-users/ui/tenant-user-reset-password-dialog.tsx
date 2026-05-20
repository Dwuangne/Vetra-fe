"use client";

import type { TenantUserSummaryDto } from "@/lib/api/types/tenant-user";
import { resetTenantUserPassword } from "@/lib/api/services/tenant-user.service";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { messages, pickLocalized, useLocale } from "@/lib/i18n";
import { toastApiError, toastMutationSuccess } from "@/lib/ui/api-toast";
import { BRAND_PRIMARY_BUTTON_CLASS } from "@/lib/ui/brand";
import { useEffect, useState } from "react";

import { TENANT_USER_PASSWORD_MIN_LENGTH } from "../lib/password-rules";
import { TenantUserPasswordField } from "./tenant-user-password-field";

type TenantUserResetPasswordDialogProps = {
  user: TenantUserSummaryDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReset: () => void;
};

export function TenantUserResetPasswordDialog({
  user,
  open,
  onOpenChange,
  onReset,
}: TenantUserResetPasswordDialogProps) {
  const { locale } = useLocale();
  const v = messages.tenantUser.validation;
  const f = messages.tenantUser.fields;
  const d = messages.tenantUser.dialogs;

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setNewPassword("");
    setConfirm("");
    setPasswordError(null);
    setConfirmError(null);
  }, [open, user?.userId]);

  const validate = (): boolean => {
    setPasswordError(null);
    setConfirmError(null);
    const lenOk =
      newPassword.length >= TENANT_USER_PASSWORD_MIN_LENGTH &&
      confirm.length >= TENANT_USER_PASSWORD_MIN_LENGTH;
    if (!lenOk) {
      if (newPassword.length < TENANT_USER_PASSWORD_MIN_LENGTH)
        setPasswordError(pickLocalized(v.passwordMin, locale));
      if (confirm.length < TENANT_USER_PASSWORD_MIN_LENGTH)
        setConfirmError(pickLocalized(v.passwordMin, locale));
      return false;
    }
    if (newPassword !== confirm) {
      setConfirmError(pickLocalized(v.passwordMismatch, locale));
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!user || !validate()) return;
    setSubmitting(true);
    try {
      await resetTenantUserPassword(user.userId, { newPassword });
      toastMutationSuccess(locale);
      onReset();
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
          <DialogTitle>{pickLocalized(d.resetPasswordTitle, locale)}</DialogTitle>
        </DialogHeader>
        {user ? (
          <p className="text-sm text-muted-foreground">
            {user.username}
          </p>
        ) : null}
        <div className="grid gap-4">
          <TenantUserPasswordField
            id="tu-reset-new"
            label={pickLocalized(f.newPassword, locale)}
            value={newPassword}
            onChange={setNewPassword}
            disabled={submitting}
            invalid={!!passwordError}
            required
          />
          {passwordError ? <p className="text-sm text-destructive">{passwordError}</p> : null}

          <TenantUserPasswordField
            id="tu-reset-confirm"
            label={pickLocalized(f.confirmPassword, locale)}
            value={confirm}
            onChange={setConfirm}
            disabled={submitting}
            invalid={!!confirmError}
            required
          />
          {confirmError ? <p className="text-sm text-destructive">{confirmError}</p> : null}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            {pickLocalized(messages.common.cancel, locale)}
          </Button>
          <Button
            type="button"
            className={BRAND_PRIMARY_BUTTON_CLASS}
            disabled={submitting || !user}
            onClick={() => void submit()}
          >
            {pickLocalized(messages.tenantUser.actions.resetPassword, locale)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
