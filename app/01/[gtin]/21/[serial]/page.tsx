import { headers } from "next/headers";
import { defaultLocale, pickLocalized } from "@/lib/i18n";
import messages from "@/lib/i18n/messages.json";
import type { Locale } from "@/lib/i18n/types";
import { PublicScanPageClient } from "@/features/public-scan";

type PageProps = {
  params: Promise<{
    gtin: string;
    serial: string;
  }>;
};

async function resolveLocale(): Promise<Locale> {
  const h = await headers();
  const accept = h.get("accept-language") ?? "";
  if (/\bvi\b/i.test(accept)) return "vi";
  return defaultLocale;
}

export default async function PublicGs1DigitalLinkPage({ params }: PageProps) {
  const { gtin, serial } = await params;
  return <PublicScanPageClient gtin={gtin} serial={serial} />;
}

export async function generateMetadata({ params }: PageProps) {
  const { gtin, serial } = await params;
  const locale = await resolveLocale();
  const titleBase = pickLocalized(messages.publicScan.tagline, locale);
  return {
    title: `${titleBase} · ${gtin} / ${serial}`,
    description: pickLocalized(messages.publicScan.footer.scanHint, locale),
  };
}
