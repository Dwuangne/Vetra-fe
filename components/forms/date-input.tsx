"use client";

import type { ComponentProps } from "react";

import { Input } from "@/components/ui/input";

type DateInputProps = Omit<ComponentProps<typeof Input>, "type" | "value" | "onChange"> & {
  value: string | null;
  onValueChange: (value: string | null) => void;
};

export function DateInput({ value, onValueChange, ...props }: DateInputProps) {
  return (
    <Input
      type="date"
      value={value ?? ""}
      onChange={(e) => onValueChange(e.target.value || null)}
      {...props}
    />
  );
}
