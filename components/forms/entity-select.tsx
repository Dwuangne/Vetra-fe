"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type EntitySelectOption = {
  value: string;
  label: string;
};

type EntitySelectProps = {
  value: string | null;
  onValueChange: (value: string | null, option?: EntitySelectOption) => void;
  loadOptions: (query: string) => Promise<EntitySelectOption[]>;
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
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  emptyText = "No options found",
  disabled,
  className,
}: EntitySelectProps) {
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
          const selectedOption = next.find((x) => x.value === value) ?? null;
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
  }, [loadOptions, query, value]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Input
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          if (!open) setOpen(true);
        }}
        placeholder={selected?.label ?? placeholder}
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
          <div className="px-2 py-1 text-xs text-muted-foreground">{searchPlaceholder}</div>
          {loading ? <div className="px-2 py-1 text-sm text-muted-foreground">Loading...</div> : null}
          {!loading && options.length === 0 ? <div className="px-2 py-1 text-sm text-muted-foreground">{emptyText}</div> : null}
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
