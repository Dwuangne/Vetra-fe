import type { ReactNode } from "react";

import messages from "@/lib/i18n/messages.json";
import { pickLocalized } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";

import { PublicScanLocaleToggle } from "./public-scan-locale-toggle";

export type PublicScanFooterVariant = "default" | "notice";

type PublicScanShellProps = {
  locale: Locale;
  accent: "green" | "red";
  headerTitle: string;
  headerSubtitle?: string;
  headerBadge?: string;
  footerVariant?: PublicScanFooterVariant;
  children: ReactNode;
};

const headerBg = {
  green: "bg-emerald-600",
  red: "bg-red-700",
} as const;

const subtitleClass = {
  green: "text-emerald-100",
  red: "text-red-100",
} as const;

export function PublicScanShell({
  locale,
  accent,
  headerTitle,
  headerSubtitle,
  headerBadge,
  footerVariant = "default",
  children,
}: PublicScanShellProps) {
  const tagline = headerSubtitle ?? pickLocalized(messages.publicScan.tagline, locale);
  const footerHint =
    footerVariant === "notice"
      ? pickLocalized(messages.publicScan.footer.noticeHint, locale)
      : pickLocalized(messages.publicScan.footer.scanHint, locale);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      <header className={`${headerBg[accent]} text-white`}>
        <div className="mx-auto flex max-w-2xl items-start justify-between gap-3 px-4 py-6">
          <div className="min-w-0 flex-1">
            <p className={`mb-1 text-sm ${subtitleClass[accent]}`}>{tagline}</p>
            <h1 className="text-xl font-bold leading-snug sm:text-2xl">{headerTitle}</h1>
            {headerBadge ? (
              <div className="mt-3 inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
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
        <p className="mt-1">{footerHint}</p>
      </footer>
    </div>
  );
}
