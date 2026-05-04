import type { ReactNode } from "react";

import messages from "@/lib/i18n/messages.json";
import { pickLocalized } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";

import { PublicScanLocaleToggle } from "./public-scan-locale-toggle";

type PublicScanShellProps = {
  locale: Locale;
  accent: "rose" | "red";
  headerTitle: string;
  headerSubtitle?: string;
  headerBadge?: string;
  children: ReactNode;
};

const headerBg = {
  rose: "bg-rose-600",
  red: "bg-red-700",
} as const;

const subtitleClass = {
  rose: "text-rose-100",
  red: "text-red-100",
} as const;

export function PublicScanShell({
  locale,
  accent,
  headerTitle,
  headerSubtitle,
  headerBadge,
  children,
}: PublicScanShellProps) {
  const logoAlt = pickLocalized(messages.publicScan.logoAlt, locale);
  const tagline = headerSubtitle ?? pickLocalized(messages.publicScan.tagline, locale);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      <header className={`${headerBg[accent]} text-white`}>
        <div className="mx-auto flex max-w-2xl items-start justify-between gap-3 px-4 py-6">
          <div className="min-w-0 flex-1">
            <p className={`mb-1 text-sm ${subtitleClass[accent]}`}>{tagline}</p>
            <h1 className="text-xl font-bold leading-snug sm:text-2xl">{headerTitle}</h1>
            {headerBadge ? (
              <div className="mt-3 inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm">
                {headerBadge}
              </div>
            ) : null}
          </div>
          <PublicScanLocaleToggle />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>

      <footer className="mx-auto max-w-2xl px-4 pb-8 text-center text-sm text-zinc-500">
        <p>{pickLocalized(messages.publicScan.footer.thanks, locale)}</p>
        <p className="mt-1">{pickLocalized(messages.publicScan.footer.scanHint, locale)}</p>
      </footer>
    </div>
  );
}
