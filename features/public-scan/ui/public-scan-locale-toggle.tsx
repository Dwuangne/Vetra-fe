"use client";

import { Languages } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { messages, pickLocalized, useLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

const OPTIONS: Locale[] = ["en", "vi"];

/**
 * Language menu for public scan: icon + label opens EN/VI options (static copy only via global locale).
 */
export function PublicScanLocaleToggle() {
  const { locale, setLocale } = useLocale();
  const nav = messages.nav;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-md border border-white/30 bg-white/10 px-2.5 py-1.5 text-sm font-medium text-white",
            "outline-none hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          )}
          aria-label={pickLocalized(nav.language, locale)}
        >
          <Languages className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
          <span>{pickLocalized(nav.language, locale)}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={(v) => {
            if (v === "en" || v === "vi") setLocale(v);
          }}
        >
          {OPTIONS.map((code) => (
            <DropdownMenuRadioItem key={code} value={code} className="cursor-pointer">
              {code === "en"
                ? pickLocalized(nav.languageEnglish, locale)
                : pickLocalized(nav.languageVietnamese, locale)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
