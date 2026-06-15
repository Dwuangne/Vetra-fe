"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { ListErrorBanner } from "@/components/list/list-error-banner";
import { ListLoadingSkeleton } from "@/components/list/list-loading-skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/features/auth";
import { AppShellLayout } from "@/features/home";
import { removeFormField } from "@/lib/api/services/form-field.service";
import type { FormFieldDto } from "@/lib/api/types/form-template";
import { canManageConfig } from "@/lib/auth/roles";
import { messages, pickLocalized, useLocale } from "@/lib/i18n";
import { getBizStepLabel } from "@/lib/production/cbv-biz-steps";
import { parseGuidQueryParam } from "@/lib/table/list-params";
import { toastApiError, toastMutationSuccess } from "@/lib/ui/api-toast";
import { BRAND_PRIMARY_BUTTON_CLASS } from "@/lib/ui/brand";

import { useFormTemplateFields } from "../hooks/use-form-template-fields";
import { FormFieldEmptyState } from "./form-field-empty-state";
import { FormFieldTable } from "./form-field-table";
import { FormFieldUpsertDialog } from "./form-field-upsert-dialog";

export function FormTemplateFieldsPage() {
  const params = useParams();
  const { locale } = useLocale();
  const { user } = useAuth();
  const templateId = parseGuidQueryParam(
    typeof params.templateId === "string" ? params.templateId : undefined
  );

  const { template, fields, loading, initialLoad, error, reload } = useFormTemplateFields(templateId);
  const [upsertOpen, setUpsertOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<FormFieldDto | null>(null);
  const [removing, setRemoving] = useState(false);

  const canMutate = canManageConfig(user?.roles);
  const pageTitle = pickLocalized(messages.formField.title, locale);
  const templatesLabel = pickLocalized(messages.formTemplate.title, locale);
  const invalidTemplateMessage = pickLocalized(messages.formField.invalidTemplateId, locale);

  const showEmpty = !loading && !error && template && fields.length === 0;
  const showTable = !error && template && fields.length > 0;

  const confirmRemove = async () => {
    if (!removeTarget || !templateId) return;
    setRemoving(true);
    try {
      await removeFormField(templateId, removeTarget.attrId);
      toastMutationSuccess(locale);
      setRemoveTarget(null);
      reload();
    } catch (e) {
      toastApiError(e, locale);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <AppShellLayout title={pageTitle}>
      <div className="flex flex-col gap-4">
        {!templateId ? (
          <ListErrorBanner message={invalidTemplateMessage} />
        ) : null}

        {templateId && initialLoad && loading ? (
          <ListLoadingSkeleton rows={6} columns={4} />
        ) : null}

        {templateId && !initialLoad && error ? (
          <ListErrorBanner message={error} onRetry={() => reload()} />
        ) : null}

        {templateId && template && !error ? (
          <>
            <div className="flex flex-col gap-2 rounded-md border bg-muted/30 px-4 py-3 text-sm">
              <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" asChild>
                    <Link href="/form-templates" aria-label={templatesLabel}>
                      <ChevronLeft className="h-4 w-4" />
                    </Link>
                  </Button>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{template.name}</p>
                    <p className="text-muted-foreground">
                      {pickLocalized(messages.formTemplate.fields.bizStep, locale)}:{" "}
                      {getBizStepLabel(template.bizStep, locale)}
                    </p>
                  </div>
                </div>
                {canMutate ? (
                  <Button
                    type="button"
                    className={`${BRAND_PRIMARY_BUTTON_CLASS} w-full sm:w-auto`}
                    onClick={() => setUpsertOpen(true)}
                    disabled={loading}
                  >
                    {pickLocalized(messages.formField.actions.add, locale)}
                  </Button>
                ) : null}
              </div>
            </div>

            {showEmpty ? (
              <FormFieldEmptyState onAdd={canMutate ? () => setUpsertOpen(true) : undefined} />
            ) : null}

            {showTable ? (
              <FormFieldTable
                rows={fields}
                locale={locale}
                loading={loading}
                disabled={loading}
                onRemove={canMutate ? (row) => setRemoveTarget(row) : undefined}
              />
            ) : null}
          </>
        ) : null}
      </div>

      {templateId && upsertOpen ? (
        <FormFieldUpsertDialog
          open={upsertOpen}
          onOpenChange={setUpsertOpen}
          templateId={templateId}
          existingFields={fields}
          onSaved={() => reload()}
        />
      ) : null}

      <Dialog open={!!removeTarget} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{pickLocalized(messages.formField.removeConfirm.title, locale)}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {pickLocalized(messages.formField.removeConfirm.description, locale)}
          </p>
          <p className="text-sm font-medium">{removeTarget?.attributeName ?? null}</p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRemoveTarget(null)}>
              {pickLocalized(messages.common.cancel, locale)}
            </Button>
            <Button type="button" variant="destructive" disabled={removing} onClick={() => void confirmRemove()}>
              {pickLocalized(messages.formField.actions.remove, locale)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShellLayout>
  );
}
