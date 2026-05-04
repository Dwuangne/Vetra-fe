"use client";

import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { defaultLocale } from "@/lib/i18n";
import { translateCommon } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

type ListErrorBannerProps = {
  /** Already localized end-user description (e.g. from `resolveApiErrorMessage`) */
  message: string;
  locale?: Locale;
  onRetry?: () => void | Promise<void>;
  title?: string;
  className?: string;
};

/**
 * Recoverable API error on list load: destructive accent + retry.
 */
export function ListErrorBanner({
  message,
  locale = defaultLocale,
  onRetry,
  title,
  className,
}: ListErrorBannerProps) {
  const heading = title ?? translateCommon("errorGeneric", locale);

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-4 md:flex-row md:items-start md:justify-between",
        className
      )}
    >
      <div className="flex gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden />
        <div>
          <p className="text-sm font-medium text-destructive">{heading}</p>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
      {onRetry && (
        <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={onRetry}>
          {translateCommon("retry", locale)}
        </Button>
      )}
    </div>
  );
}
