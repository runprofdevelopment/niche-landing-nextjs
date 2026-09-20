"use client";

/**
 * MultiSelect — a searchable combobox that allows selecting several options.
 * The trigger looks like Select's (click to open, search field inside the
 * popup); selected values render as removable chips in a wrapping row
 * underneath it. Built on Base UI's Combobox with `multiple`.
 */

import { Combobox } from "@base-ui/react/combobox";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";

import { fieldInvalidClassName } from "./input";
import { useAllowPortaledMenuScroll } from "./use-allow-portaled-menu-scroll";

import type { UIEvent } from "react";

export type MultiSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type MultiSelectProps = {
  items: MultiSelectOption[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  /** Show the search field inside the popup. Defaults to `true`. */
  searchable?: boolean;
  disabled?: boolean;
  className?: string;
  /** Set when the list is paged: shows a spinner and drives infinite scroll. */
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  /**
   * Options for values that may not be on a loaded page yet (e.g. a resumed
   * draft's saved branches), merged in so their chips/labels always render.
   */
  selectedOptions?: MultiSelectOption[];
  /**
   * Delegates search to the backend instead of filtering only loaded items.
   * Called (debounced) with the trimmed query as the user types.
   */
  onSearchChange?: (query: string) => void;
};

const SEARCH_DEBOUNCE_MS = 300;

function toOptions(items: MultiSelectOption[], values: string[] | undefined) {
  if (!values) return undefined;
  return items.filter((option) => values.includes(option.value));
}

function MultiSelect({
  items,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  searchable = true,
  disabled,
  className,
  loading = false,
  hasMore = false,
  onLoadMore,
  selectedOptions,
  onSearchChange,
}: MultiSelectProps) {
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);
  const popupScrollRef = useAllowPortaledMenuScroll(open);
  const resolvedPlaceholder = placeholder ?? t("selectPlaceholder");
  const resolvedSearchPlaceholder = searchPlaceholder ?? t("searchPlaceholder");
  const resolvedEmptyMessage = emptyMessage ?? t("noResults");

  const [search, setSearch] = useState("");

  // Remember every option ever selected so chips/labels survive list resets.
  // Keyed by value to avoid duplicates and preserve the latest label.
  const [rememberedOptions, setRememberedOptions] = useState<Map<string, MultiSelectOption>>(
    () => new Map(selectedOptions?.map((o) => [o.value, o])),
  );

  useEffect(() => {
    if (!onSearchChange) return;
    const handle = setTimeout(() => onSearchChange(search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [search, onSearchChange]);

  // Merge in any remembered option (or caller-provided selectedOptions) not
  // present in the current page so chips/labels always render.
  const baseItems = useMemo(() => {
    // Prefer caller-supplied selectedOptions (covers async edit-form load);
    // fall back to what the user picked interactively during this session.
    const anchors = selectedOptions?.length
      ? selectedOptions
      : Array.from(rememberedOptions.values());
    if (!anchors.length) return items;
    const known = new Set(items.map((item) => item.value));
    const missing = anchors.filter((option) => !known.has(option.value));
    return missing.length > 0 ? [...missing, ...items] : items;
  }, [items, selectedOptions, rememberedOptions]);

  const handleListScroll = (event: UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom > 48) return;
    if (!hasMore || loading) return;
    onLoadMore?.();
  };

  return (
    <Combobox.Root<MultiSelectOption, true>
      items={baseItems}
      multiple
      disabled={disabled}
      value={value !== undefined ? toOptions(baseItems, value) : undefined}
      defaultValue={defaultValue !== undefined ? toOptions(baseItems, defaultValue) : undefined}
      onValueChange={(options) => {
        // Keep memory in sync: reflect the exact current selection.
        setRememberedOptions(new Map(options.map((o) => [o.value, o])));
        onValueChange?.(options.map((option) => option.value));
      }}
      itemToStringLabel={(option) => option?.label ?? ""}
      isItemEqualToValue={(a, b) => a?.value === b?.value}
      filter={onSearchChange ? null : searchable ? undefined : null}
      inputValue={search}
      onInputValueChange={(next) => setSearch(next)}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) setSearch("");
      }}
    >
      <Combobox.Value>
        {(selected: MultiSelectOption[]) => (
          <>
            <Combobox.Trigger
              disabled={disabled}
              data-slot="multi-select-trigger"
              className={cn(
                "flex h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-border bg-input px-2.5 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none",
                "data-[popup-open]:border-ring focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                "data-disabled:cursor-not-allowed data-disabled:opacity-50",
                fieldInvalidClassName,
                className,
              )}
            >
              <span
                className={cn(
                  "truncate",
                  selected.length > 0 ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {selected.length > 0
                  ? t("selectedCount", { count: selected.length })
                  : resolvedPlaceholder}
              </span>
              <Combobox.Icon className="shrink-0 text-muted-foreground">
                <ChevronsUpDown className="size-4" />
              </Combobox.Icon>
            </Combobox.Trigger>

            {selected.length > 0 ? (
              <Combobox.Chips className="flex w-full flex-wrap items-center gap-2">
                {selected.map((option) => (
                  <Combobox.Chip
                    key={option.value}
                    aria-label={option.label}
                    className="flex h-6 items-center gap-1 rounded-md bg-selected ps-2 pe-1 text-xs font-semibold text-selected-foreground outline-none data-highlighted:bg-selected/70"
                  >
                    {option.label}
                    <Combobox.ChipRemove
                      aria-label={`Remove ${option.label}`}
                      className="inline-flex size-4 cursor-pointer items-center justify-center rounded-sm text-selected-foreground/70 hover:text-selected-foreground"
                    >
                      <X className="size-3" />
                    </Combobox.ChipRemove>
                  </Combobox.Chip>
                ))}
              </Combobox.Chips>
            ) : null}
          </>
        )}
      </Combobox.Value>

      <Combobox.Portal>
        <Combobox.Positioner sideOffset={4} align="start" className="z-100">
          <Combobox.Popup
            ref={(node) => {
              popupScrollRef.current = node;
            }}
            data-slot="multi-select-content"
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
            <Combobox.List
              className="max-h-60 min-h-0 overflow-y-auto overscroll-contain p-1 data-empty:p-0"
              onScroll={handleListScroll}
            >
              {(option: MultiSelectOption) => (
                <Combobox.Item
                  key={option.value}
                  value={option}
                  disabled={option.disabled}
                  className={cn(
                    "relative flex w-full cursor-pointer items-center gap-2 rounded-md py-1.5 pe-8 ps-2 text-sm outline-none select-none",
                    "data-[selected]:bg-selected data-[selected]:text-selected-foreground",
                    "data-highlighted:bg-selected data-highlighted:text-selected-foreground",
                    "data-disabled:pointer-events-none data-disabled:opacity-50",
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  <Combobox.ItemIndicator className="absolute end-2 flex items-center text-selected-foreground">
                    <Check className="size-4" />
                  </Combobox.ItemIndicator>
                </Combobox.Item>
              )}
            </Combobox.List>

            {loading ? (
              <div className="flex shrink-0 items-center justify-center border-t border-border py-2">
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              </div>
            ) : null}
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}

export { MultiSelect };
