"use client";

import { Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";
import { messages, pickLocalized, useLocale } from "@/lib/i18n";
import { BRAND_PRIMARY_BUTTON_CLASS } from "@/lib/ui/brand";
import { cn } from "@/lib/utils";

type FormFieldEmptyStateProps = {
  className?: string;
  onAdd?: () => void;
};

export function FormFieldEmptyState({ className, onAdd }: FormFieldEmptyStateProps) {
  const { locale } = useLocale();
  const title = pickLocalized(messages.formField.empty.noData, locale);
  const description = pickLocalized(messages.formField.empty.noDataDescription, locale);
  const addLabel = pickLocalized(messages.formField.actions.add, locale);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-md border border-dashed px-6 py-12 text-center",
        className
      )}
      role="status"
    >
      <Inbox className="mb-3 h-10 w-10 text-muted-foreground" aria-hidden />
      <p className="text-base font-medium">{title}</p>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      {onAdd ? (
        <Button type="button" className={cn("mt-6", BRAND_PRIMARY_BUTTON_CLASS)} onClick={onAdd}>
          {addLabel}
        </Button>
      ) : null}
    </div>
  );
}
