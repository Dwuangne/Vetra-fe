"use client";

import { Copy } from "lucide-react";
import { useMemo, useState } from "react";

import { EntitySelect } from "@/components/forms/entity-select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { listBatches } from "@/lib/api/services/batch.service";
import { openVerificationSession } from "@/lib/api/services/verification-session.service";
import { normalizeBatchStatus } from "@/lib/production/batch-status";
import { messages, pickLocalized, useLocale } from "@/lib/i18n";
import { toast } from "@/hooks/use-toast";
import { toastApiError, toastMutationSuccess } from "@/lib/ui/api-toast";
import { BRAND_PRIMARY_BUTTON_CLASS } from "@/lib/ui/brand";

type OpenVerificationSessionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpened: () => void;
};

export function OpenVerificationSessionDialog({
  open,
  onOpenChange,
  onOpened,
}: OpenVerificationSessionDialogProps) {
  const { locale } = useLocale();
  const [batchId, setBatchId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [createdSessionId, setCreatedSessionId] = useState<string | null>(null);

  const m = messages.verificationSession;
  const title = pickLocalized(m.openDialog.title, locale);

  const loadBatchOptions = useMemo(
    () => async (query: string) => {
      const res = await listBatches({ keyword: query || undefined, page: 1, size: 50 });
      return (res.data?.items ?? [])
        .map((b) => ({
          value: b.batchId,
          label: b.lotNumber,
        }));
    },
    []
  );

  const reset = () => {
    setBatchId(null);
    setCreatedToken(null);
    setCreatedSessionId(null);
    setSubmitting(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const submit = async () => {
    if (!batchId) return;
    setSubmitting(true);
    try {
      const res = await openVerificationSession({ batchId });
      const data = res.data;
      if (!data?.sessionToken) return;
      setCreatedToken(data.sessionToken);
      setCreatedSessionId(data.sessionId);
      toastMutationSuccess(locale);
      onOpened();
    } catch (e) {
      toastApiError(e, locale);
    } finally {
      setSubmitting(false);
    }
  };

  const copyToken = async () => {
    if (!createdToken) return;
    try {
      await navigator.clipboard.writeText(createdToken);
      toast({ title: pickLocalized(m.tokenCopied, locale) });
    } catch {
      /* clipboard unavailable */
    }
  };

  const closeAfterToken = () => {
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {createdToken
              ? pickLocalized(m.openDialog.tokenWarning, locale)
              : pickLocalized(m.openDialog.hint, locale)}
          </DialogDescription>
        </DialogHeader>

        {createdToken ? (
          <div className="flex flex-col gap-4 py-2">
            <div className="rounded-md border bg-muted/40 p-3">
              <p className="mb-1 text-xs text-muted-foreground">{pickLocalized(m.fields.token, locale)}</p>
              <p className="break-all font-mono text-sm">{createdToken}</p>
              {createdSessionId ? (
                <p className="mt-2 font-mono text-xs text-muted-foreground">{createdSessionId}</p>
              ) : null}
            </div>
            <Button type="button" variant="outline" size="sm" className="w-fit gap-2" onClick={() => void copyToken()}>
              <Copy className="h-4 w-4" />
              {pickLocalized(m.actions.copyToken, locale)}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium leading-none">
                {pickLocalized(m.filters.batch, locale)}
              </label>
              <EntitySelect
                value={batchId}
                onValueChange={(id) => setBatchId(id)}
                loadOptions={loadBatchOptions}
                placeholder={pickLocalized(m.filters.batch, locale)}
                disabled={submitting}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          {createdToken ? (
            <Button type="button" className={BRAND_PRIMARY_BUTTON_CLASS} onClick={closeAfterToken}>
              {pickLocalized(m.actions.done, locale)}
            </Button>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={submitting}>
                {pickLocalized(messages.common.cancel, locale)}
              </Button>
              <Button
                type="button"
                className={BRAND_PRIMARY_BUTTON_CLASS}
                onClick={() => void submit()}
                disabled={submitting || !batchId}
              >
                {pickLocalized(m.actions.openSession, locale)}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
