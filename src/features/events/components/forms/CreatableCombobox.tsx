"use client";

import { Combobox } from "@base-ui/react/combobox";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useState } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";
import { fieldInvalidClassName } from "@/shared/components/ui/input";

export type CreatableOption = {
  value: string;
  label: string;
};

type CreatableComboboxProps = {
  options: CreatableOption[];
  /** Selected option value, or the free-typed label when creating */
  value: string;
  onChange: (next: { value: string; label: string; isNew: boolean }) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  createLabel?: (query: string) => string;
  disabled?: boolean;
  className?: string;
  "aria-invalid"?: boolean | undefined;
};

/**
 * Searchable select that also accepts a custom value (type to create).
 */
export function CreatableCombobox({
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  createLabel,
  disabled,
  className,
  "aria-invalid": ariaInvalid,
}: CreatableComboboxProps) {
  const t = useTranslations("common");
  const tEvents = useTranslations("events");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const selected =
    options.find((option) => option.value === value || option.label === value) ??
    (value.trim() ? { value, label: value } : null);

  const query = search.trim();
  const queryLower = query.toLowerCase();
  const filtered = queryLower
    ? options.filter((option) => option.label.toLowerCase().includes(queryLower))
    : options;

  const exactMatch = options.some((option) => option.label.toLowerCase() === queryLower);
  const showCreate = query.length > 0 && !exactMatch;

  const resolvedPlaceholder = placeholder ?? t("selectPlaceholder");
  const resolvedSearchPlaceholder = searchPlaceholder ?? t("searchPlaceholder");
  const resolvedEmpty = emptyMessage ?? t("noResults");

  return (
    <Combobox.Root<CreatableOption>
      items={filtered}
      disabled={disabled}
      value={selected}
      onValueChange={(option) => {
        if (!option) return;
        const isNew = !options.some((entry) => entry.value === option.value);
        onChange({ value: option.value, label: option.label, isNew });
        setSearch("");
      }}
      itemToStringLabel={(option) => option?.label ?? ""}
      isItemEqualToValue={(a, b) => a?.value === b?.value}
      inputValue={search}
      onInputValueChange={setSearch}
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setSearch("");
      }}
    >
      <Combobox.Trigger
        data-slot="select-trigger"
        aria-invalid={ariaInvalid || undefined}
        className={cn(
          "flex h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-border bg-input px-2.5 py-1 text-sm text-foreground shadow-xs transition-[color,box-shadow] outline-none",
          "data-popup-open:border-ring focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "data-disabled:cursor-not-allowed data-disabled:opacity-50",
          fieldInvalidClassName,
          className,
        )}
      >
        <span className={cn("truncate", selected ? "text-foreground" : "text-muted-foreground")}>
          {selected ? selected.label : resolvedPlaceholder}
        </span>
        <Combobox.Icon className="shrink-0 text-muted-foreground">
          <ChevronsUpDown className="size-4" />
        </Combobox.Icon>
      </Combobox.Trigger>

      <Combobox.Portal>
        <Combobox.Positioner sideOffset={4} align="start" className="z-50">
          <Combobox.Popup
            className={cn(
              "w-(--anchor-width) max-w-(--available-width) overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-md outline-none",
              "origin-(--transform-origin) transition-[transform,opacity] data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0",
            )}
          >
            <div className="p-1.5">
              <Combobox.Input
                placeholder={resolvedSearchPlaceholder}
                className="h-8 w-full rounded-md border border-border bg-input px-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
            <Combobox.Empty>
              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                {resolvedEmpty}
              </div>
            </Combobox.Empty>
            <Combobox.List className="max-h-[min(20rem,var(--available-height))] overflow-y-auto overscroll-contain p-1 data-empty:p-0">
              {(option: CreatableOption) => (
                <Combobox.Item
                  key={option.value}
                  value={option}
                  className={cn(
                    "relative flex w-full cursor-pointer items-center gap-2 rounded-md py-1.5 pe-8 ps-2 text-sm outline-none select-none",
                    "data-selected:bg-selected data-selected:text-selected-foreground",
                    "data-highlighted:bg-selected data-highlighted:text-selected-foreground",
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  <Combobox.ItemIndicator className="absolute inset-e-2 flex items-center text-selected-foreground">
                    <Check className="size-4" />
                  </Combobox.ItemIndicator>
                </Combobox.Item>
              )}
            </Combobox.List>
            {showCreate ? (
              <button
                type="button"
                className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-sm text-primary hover:bg-secondary"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange({ value: query, label: query, isNew: true });
                  setSearch("");
                  setOpen(false);
                }}
              >
                <Plus className="size-4" />
                {createLabel?.(query) ?? tEvents("createFamilyOption", { name: query })}
              </button>
            ) : null}
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}
