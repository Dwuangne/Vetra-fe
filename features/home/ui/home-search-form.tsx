"use client";

import { Search } from "lucide-react";

import { SidebarGroup, SidebarGroupContent, SidebarInput } from "@/components/ui/sidebar";
import { messages, pickLocalized, useLocale } from "@/lib/i18n";

type HomeSearchFormProps = {
  value: string;
  onChange: (value: string) => void;
};

export function HomeSearchForm({ value, onChange }: HomeSearchFormProps) {
  const { locale } = useLocale();
  const placeholder = pickLocalized(messages.nav.searchPlaceholder, locale);

  return (
    <form onSubmit={(e) => e.preventDefault()} role="search">
      <SidebarGroup className="py-0">
        <SidebarGroupContent className="relative">
          <SidebarInput
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            className="pl-8 w-58"
            autoComplete="off"
          />
          <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 select-none opacity-50" />
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  );
}
