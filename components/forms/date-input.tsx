"use client";

import type { ComponentProps } from "react";

import { Input } from "@/components/ui/input";
import { NATIVE_DATE_INPUT_CLASS } from "@/lib/ui/form-control-classes";
import { cn } from "@/lib/utils";

type DateInputProps = Omit<ComponentProps<typeof Input>, "type" | "value" | "onChange"> & {
  value: string | null;
  onValueChange: (value: string | null) => void;
};

export function DateInput({ value, onValueChange, className, ...props }: DateInputProps) {
  return (
    <Input
      type="date"
      className={cn(NATIVE_DATE_INPUT_CLASS, className)}
      value={value ?? ""}
      onChange={(e) => onValueChange(e.target.value || null)}
      {...props}
    />
  );
}
