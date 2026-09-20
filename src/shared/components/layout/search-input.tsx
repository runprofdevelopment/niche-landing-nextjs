"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/shared/components/ui/input";

type SearchInputProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  debounceMs?: number;
};

export function SearchInput({
  value,
  defaultValue,
  onValueChange,
  placeholder,
  disabled,
  className,
  debounceMs = 200,
}: SearchInputProps) {
  const [internal, setInternal] = useState(() => value ?? defaultValue ?? "");
  const [prevValue, setPrevValue] = useState(value);

  // Sync controlled `value` during render — avoids setState inside an effect.
  if (value !== undefined && value !== prevValue) {
    setPrevValue(value);
    setInternal(value);
  }

  useEffect(() => {
    if (!onValueChange) return;
    const handle = setTimeout(() => onValueChange(internal), debounceMs);
    return () => clearTimeout(handle);
  }, [internal, onValueChange, debounceMs]);

  return (
    <div className={cn("relative", className)}>
      <Search
        aria-hidden
        className="pointer-events-none absolute inset-y-0 start-2 my-auto size-4 text-muted-foreground"
      />
      <Input
        type="search"
        value={internal}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => setInternal(event.target.value)}
        className="ps-8"
      />
    </div>
  );
}
