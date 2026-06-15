"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

type ListRowIconLinkProps = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export function ListRowIconLink({ href, label, icon: Icon }: ListRowIconLinkProps) {
  return (
    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" asChild>
      <Link href={href} aria-label={label} title={label}>
        <Icon className="h-4 w-4" aria-hidden />
      </Link>
    </Button>
  );
}
