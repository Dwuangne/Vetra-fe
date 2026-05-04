"use client";

import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type StatusTransitionMenuProps<TStatus extends string> = {
  currentStatus: TStatus;
  nextStatuses: TStatus[];
  onTransition: (nextStatus: TStatus) => Promise<void> | void;
  disabled?: boolean;
  labelResolver?: (status: TStatus) => string;
  triggerText?: string;
};

export function StatusTransitionMenu<TStatus extends string>({
  currentStatus,
  nextStatuses,
  onTransition,
  disabled,
  labelResolver,
  triggerText = "Transition",
}: StatusTransitionMenuProps<TStatus>) {
  const [submitting, setSubmitting] = useState(false);
  const resolveLabel = labelResolver ?? ((status: TStatus) => status);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm" disabled={disabled || submitting || nextStatuses.length === 0}>
          {triggerText}
          <ChevronsUpDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {nextStatuses.map((status) => (
          <DropdownMenuItem
            key={status}
            disabled={submitting || status === currentStatus}
            onClick={async () => {
              setSubmitting(true);
              try {
                await onTransition(status);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {resolveLabel(status)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
