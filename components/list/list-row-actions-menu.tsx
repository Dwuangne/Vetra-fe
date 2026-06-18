"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type ListRowActionItem = {
  key: string;
  label: string;
  onSelect?: () => void;
  href?: string;
  destructive?: boolean;
};

type ListRowActionsMenuProps = {
  actionsLabel: string;
  disabled?: boolean;
  items: ListRowActionItem[];
};

export function ListRowActionsMenu({ actionsLabel, disabled, items }: ListRowActionsMenuProps) {
  if (items.length === 0) {
    return null;
  }

  const firstDestructiveIndex = items.findIndex((item) => item.destructive);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          aria-label={actionsLabel}
          disabled={disabled}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {items.map((item, index) => {
          const showSeparator =
            firstDestructiveIndex > 0 && index === firstDestructiveIndex;
          const itemClassName = cn(item.destructive && "text-destructive focus:text-destructive");

          return (
            <span key={item.key}>
              {showSeparator ? <DropdownMenuSeparator /> : null}
              {item.href ? (
                <DropdownMenuItem asChild className={itemClassName}>
                  <Link href={item.href}>{item.label}</Link>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem className={itemClassName} onSelect={item.onSelect}>
                  {item.label}
                </DropdownMenuItem>
              )}
            </span>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
