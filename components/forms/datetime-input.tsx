"use client";

import type { ComponentProps } from "react";

import { Input } from "@/components/ui/input";
import { HIDE_NATIVE_PICKER_CLASS } from "@/lib/ui/form-control-classes";
import { cn } from "@/lib/utils";

type DatetimeInputProps = Omit<ComponentProps<typeof Input>, "type" | "value" | "onChange"> & {
  value: string | null;
  onValueChange: (value: string | null) => void;
};

function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return "";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "";

  const local = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export function DatetimeInput({ value, onValueChange, className, ...props }: DatetimeInputProps) {
  return (
    <Input
      type="datetime-local"
      className={cn(HIDE_NATIVE_PICKER_CLASS, className)}
      value={toDatetimeLocalValue(value)}
      onChange={(e) => onValueChange(e.target.value ? new Date(e.target.value).toISOString() : null)}
      {...props}
    />
  );
}
