"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BRAND_PRIMARY_BUTTON_CLASS } from "@/lib/ui/brand";

type ListPaginationProps = {
  page: number;
  totalPages: number;
  loading: boolean;
  disabled?: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export function ListPagination({
  page,
  totalPages,
  loading,
  disabled,
  onPrev,
  onNext,
}: ListPaginationProps) {
  if (totalPages <= 1) return null;

  const atFirst = page <= 1;
  const atLast = page >= totalPages;

  return (
    <div className="flex items-center justify-end gap-2 border-t px-3 py-2">
      <span className="mr-auto text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <Button
        type="button"
        variant="default"
        className={BRAND_PRIMARY_BUTTON_CLASS}
        size="sm"
        onClick={onPrev}
        disabled={disabled || loading || atFirst}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="default"
        className={BRAND_PRIMARY_BUTTON_CLASS}
        size="sm"
        onClick={onNext}
        disabled={disabled || loading || atLast}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
