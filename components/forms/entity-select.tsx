"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { translateCommon, useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type EntitySelectOption = {
  value: string;
  label: string;
};

type EntitySelectProps = {
  value: string | null;
  onValueChange: (value: string | null, option?: EntitySelectOption) => void;
  loadOptions: (query: string) => Promise<EntitySelectOption[]>;
  /** Display label when `value` is preset but not yet in loaded options (e.g. deep link). */
  selectedLabel?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
};

export function EntitySelect({
  value,
  onValueChange,
  loadOptions,
  selectedLabel,
  placeholder,
  searchPlaceholder,
  emptyText,
  disabled,
  className,
}: EntitySelectProps) {
  const { locale } = useLocale();
  const resolvedPlaceholder = placeholder ?? translateCommon("entitySelectPlaceholder", locale);
  const resolvedSearchPlaceholder =
    searchPlaceholder ?? translateCommon("entitySelectSearchPlaceholder", locale);
  const resolvedEmptyText = emptyText ?? translateCommon("entitySelectEmpty", locale);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<EntitySelectOption | null>(null);
  const [options, setOptions] = useState<EntitySelectOption[]>([]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let active = true;
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      try {
        const next = await loadOptions(query.trim());
        if (!active) return;
        setOptions(next);
        if (value) {
          const selectedOption =
            next.find((x) => x.value === value) ??
            (selectedLabel ? { value, label: selectedLabel } : null);
          setSelected(selectedOption);
        } else {
          setSelected(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [loadOptions, query, value, selectedLabel]);

  const displayValue = open ? query : (selected?.label ?? selectedLabel ?? query);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <Input
        value={displayValue}
        className={cn(value && "pr-9")}
        onFocus={() => {
          setOpen(true);
          setQuery("");
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          if (!open) setOpen(true);
        }}
        placeholder={resolvedPlaceholder}
        disabled={disabled}
        autoComplete="off"
      />
      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1 h-8 w-8"
          onClick={() => {
            setQuery("");
            setSelected(null);
            onValueChange(null);
          }}
          disabled={disabled}
        >
          <X />
        </Button>
      ) : null}
      {open ? (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          <div className="px-2 py-1 text-xs text-muted-foreground">{resolvedSearchPlaceholder}</div>
          {loading ? (
            <div className="px-2 py-1 text-sm text-muted-foreground">
              {translateCommon("loading", locale)}
            </div>
          ) : null}
          {!loading && options.length === 0 ? (
            <div className="px-2 py-1 text-sm text-muted-foreground">{resolvedEmptyText}</div>
          ) : null}
          {!loading
            ? options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    "w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground",
                    value === option.value && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => {
                    setSelected(option);
                    setQuery("");
                    setOpen(false);
                    onValueChange(option.value, option);
                  }}
                >
                  {option.label}
                </button>
              ))
            : null}
        </div>
      ) : null}
    </div>
  );
}
