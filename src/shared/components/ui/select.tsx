"use client";

import { Combobox } from "@base-ui/react/combobox";
import { Check, ChevronsUpDown } from "lucide-react";
import { useMemo, useState } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";

import { fieldInvalidClassName } from "./input";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectProps = {
  items: SelectOption[];
  value?: string | null;
  onValueChange?: (value: string | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  searchable?: boolean;
  disabled?: boolean;
  className?: string;
};

function findOption(items: SelectOption[], value: string | null | undefined) {
  return items.find((option) => option.value === value) ?? null;
}

function Select({
  items,
  value,
  onValueChange,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  searchable = true,
  disabled,
  className,
}: SelectProps) {
  const t = useTranslations("common");
  const resolvedPlaceholder = placeholder ?? t("selectPlaceholder");
  const resolvedSearchPlaceholder = searchPlaceholder ?? t("searchPlaceholder");
  const resolvedEmptyMessage = emptyMessage ?? t("noResults");

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const visibleItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!searchable || !query) return items;
    return items.filter((item) => item.label.toLowerCase().includes(query));
  }, [items, search, searchable]);

  return (
    <Combobox.Root<SelectOption>
      items={visibleItems}
      disabled={disabled}
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setSearch("");
      }}
      value={value !== undefined ? findOption(items, value) : undefined}
      onValueChange={(option) => {
        onValueChange?.(option ? option.value : null);
        setSearch("");
        setOpen(false);
      }}
      itemToStringLabel={(option) => option?.label ?? ""}
      isItemEqualToValue={(a, b) => a?.value === b?.value}
      filter={null}
      inputValue={search}
      onInputValueChange={(next) => setSearch(next)}
    >
      <Combobox.Trigger
        data-slot="select-trigger"
        className={cn(
          "flex h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-border bg-input px-2.5 py-1 text-sm text-foreground shadow-xs transition-[color,box-shadow] outline-none",
          "data-popup-open:border-ring focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "data-disabled:cursor-not-allowed data-disabled:opacity-50",
          fieldInvalidClassName,
          className,
        )}
      >
        <Combobox.Value>
          {(selectedOption: SelectOption | null) => (
            <span
              className={cn(
                "truncate",
                selectedOption ? "text-inherit" : "text-muted-foreground",
              )}
            >
              {selectedOption ? selectedOption.label : resolvedPlaceholder}
            </span>
          )}
        </Combobox.Value>
        <Combobox.Icon className="shrink-0 text-inherit opacity-70">
          <ChevronsUpDown className="size-4" />
        </Combobox.Icon>
      </Combobox.Trigger>

      <Combobox.Portal>
        <Combobox.Positioner sideOffset={4} align="start" className="z-100">
          <Combobox.Popup
            data-slot="select-content"
            className={cn(
              "flex w-(--anchor-width) max-h-72 max-w-(--available-width) flex-col overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-md outline-none",
              "origin-(--transform-origin) transition-[transform,opacity] data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0",
            )}
          >
            {searchable ? (
              <div className="shrink-0 border-b border-border p-1.5">
                <Combobox.Input
                  placeholder={resolvedSearchPlaceholder}
                  className="h-8 w-full rounded-md border border-border bg-input px-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
            ) : null}
            <Combobox.Empty>
              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                {resolvedEmptyMessage}
              </div>
            </Combobox.Empty>
            <Combobox.List className="max-h-60 min-h-0 overflow-y-auto overscroll-contain p-1 data-empty:p-0">
              {(option: SelectOption) => (
                <Combobox.Item
                  key={option.value}
                  value={option}
                  disabled={option.disabled}
                  className={cn(
                    "relative flex w-full cursor-pointer items-center gap-2 rounded-md py-1.5 pe-8 ps-2 text-sm outline-none select-none",
                    "data-selected:bg-selected data-selected:text-selected-foreground",
                    "data-highlighted:bg-selected data-highlighted:text-selected-foreground",
                    "data-disabled:pointer-events-none data-disabled:opacity-50",
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  <Combobox.ItemIndicator className="absolute inset-e-2 flex items-center text-selected-foreground">
                    <Check className="size-4" />
                  </Combobox.ItemIndicator>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}

export { Select };
