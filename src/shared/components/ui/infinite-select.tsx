"use client";

import { Combobox } from "@base-ui/react/combobox";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";

import { fieldInvalidClassName } from "./input";
import { useAllowPortaledMenuScroll } from "./use-allow-portaled-menu-scroll";

import type { SelectOption } from "./select";
import type { UIEvent } from "react";

type InfiniteSelectProps = {
  items: SelectOption[];
  value?: string | null;
  onValueChange?: (value: string | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  /**
   * The currently-selected option, merged into the list so its label always
   * renders even before the page it lives on has loaded. Needed in edit forms
   * where the persisted value may sit beyond the first fetched page.
   */
  selectedOption?: SelectOption | null;
  /**
   * Delegates search to the backend instead of filtering only the items
   * already loaded — called (debounced) with the trimmed query as the user
   * types. When provided, `items` is trusted as already search-filtered.
   */
  onSearchChange?: (query: string) => void;
};

const SEARCH_DEBOUNCE_MS = 300;

function findOption(items: SelectOption[], value: string | null | undefined) {
  return items.find((option) => option.value === value) ?? null;
}

/**
 * Searchable select that loads the next page only when the user scrolls
 * near the bottom of the options list.
 *
 * Client filter is manual (`filter={null}`) so newly loaded pages always
 * appear — Base UI's built-in filter can hide items while the list grows.
 */
function InfiniteSelect({
  items,
  value,
  onValueChange,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  disabled,
  className,
  loading = false,
  hasMore = false,
  onLoadMore,
  selectedOption,
  onSearchChange,
}: InfiniteSelectProps) {
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);
  const popupScrollRef = useAllowPortaledMenuScroll(open);
  const resolvedPlaceholder = placeholder ?? t("selectPlaceholder");
  const resolvedSearchPlaceholder = searchPlaceholder ?? t("searchPlaceholder");
  const resolvedEmptyMessage = emptyMessage ?? t("noResults");

  const [search, setSearch] = useState("");

  // Remember the last picked option so its label survives list resets (e.g.
  // when the list resets to the first page after the dropdown closes, an
  // option selected from a deeper page would otherwise disappear).
  const [rememberedOption, setRememberedOption] = useState<SelectOption | null>(
    () => selectedOption ?? null,
  );

  useEffect(() => {
    if (!onSearchChange) return;
    const handle = setTimeout(() => onSearchChange(search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [search, onSearchChange]);

  // Prefer the caller-supplied selectedOption (covers async edit-form load),
  // then fall back to what the user last picked interactively.
  const anchorOption = selectedOption ?? rememberedOption;

  // Ensure the selected option is always present so its label shows on the
  // trigger even when it belongs to a page that hasn't been loaded yet.
  const baseItems = useMemo(() => {
    if (!anchorOption || items.some((item) => item.value === anchorOption.value)) {
      return items;
    }
    return [anchorOption, ...items];
  }, [items, anchorOption]);

  // When `onSearchChange` is set, `items` is already search-filtered by the
  // backend — filtering it again locally would hide matches that don't
  // happen to also contain the raw, not-yet-debounced query.
  const visibleItems = useMemo(() => {
    if (onSearchChange) return baseItems;
    const query = search.trim().toLowerCase();
    if (!query) return baseItems;
    return baseItems.filter((item) => item.label.toLowerCase().includes(query));
  }, [baseItems, search, onSearchChange]);

  const handleListScroll = (event: UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom > 48) return;
    if (!hasMore || loading) return;
    // Local-filter mode only: don't paginate while the already-loaded list
    // is being filtered by search text. Server-search mode paginates the
    // matched results themselves, so it's allowed to load more.
    if (!onSearchChange && search.trim()) return;
    onLoadMore?.();
  };

  return (
    <Combobox.Root<SelectOption>
      items={visibleItems}
      value={
        value !== undefined ? (findOption(baseItems, value) ?? anchorOption ?? null) : undefined
      }
      onValueChange={(option) => {
        if (option) setRememberedOption(option);
        else setRememberedOption(null);
        onValueChange?.(option ? option.value : null);
      }}
      itemToStringLabel={(option) => option?.label ?? ""}
      isItemEqualToValue={(a, b) => a?.value === b?.value}
      filter={null}
      inputValue={search}
      onInputValueChange={(next) => setSearch(next)}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) setSearch("");
      }}
    >
      <Combobox.Trigger
        disabled={disabled}
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
                selectedOption ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {selectedOption ? selectedOption.label : resolvedPlaceholder}
            </span>
          )}
        </Combobox.Value>
        <Combobox.Icon className="shrink-0 text-muted-foreground">
          <ChevronsUpDown className="size-4" />
        </Combobox.Icon>
      </Combobox.Trigger>

      <Combobox.Portal>
        <Combobox.Positioner sideOffset={4} align="start" className="z-100">
          <Combobox.Popup
            ref={(node) => {
              popupScrollRef.current = node;
            }}
            data-slot="select-content"
            className={cn(
              "flex w-(--anchor-width) max-h-72 max-w-(--available-width) flex-col overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-md outline-none",
              "origin-(--transform-origin) transition-[transform,opacity] data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0",
            )}
          >
            <div className="shrink-0 border-b border-border p-1.5">
              <Combobox.Input
                placeholder={resolvedSearchPlaceholder}
                className="h-8 w-full rounded-md border border-border bg-input px-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
            <Combobox.Empty>
              {!loading ? (
                <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                  {resolvedEmptyMessage}
                </div>
              ) : (
                <div className="flex items-center justify-center px-2 py-6">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </Combobox.Empty>
            <Combobox.List
              className="max-h-60 min-h-0 overflow-y-auto overscroll-contain p-1 data-empty:p-0"
              onScroll={handleListScroll}
            >
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

            {loading && visibleItems.length > 0 ? (
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

export { InfiniteSelect };
export type { InfiniteSelectProps };
