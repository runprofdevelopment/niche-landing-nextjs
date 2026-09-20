"use client";

/**
 * Combobox — dropdown with fixed options, plus free typing.
 *
 * Dropdown list always comes from `items` (e.g. x, y, z).
 * The user may type any other value (e.g. a) that is not in the list —
 * that text is kept as-is via `inputValue` / `onInputValueChange` and is
 * never injected into the dropdown options.
 */

import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { Check, ChevronsUpDown } from "lucide-react";
import { useMemo, useState } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";

import { fieldControlClassName, fieldInvalidClassName } from "./input";
import { useAllowPortaledMenuScroll } from "./use-allow-portaled-menu-scroll";

export type ComboboxOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

/** Sentinel so Base UI treats free text as a selected value and does not clear it on blur. */
const FREE_TEXT_VALUE = "__combobox_free_text__";

type ComboboxProps = {
  items: ComboboxOption[];
  /** Selected option `value` when choosing from the dropdown. */
  value?: string | null;
  /** Text shown in the field (selected label or free-typed custom text). */
  inputValue?: string;
  onValueChange?: (value: string | null) => void;
  onInputValueChange?: (value: string) => void;
  /**
   * When true, text that does not match any option is allowed.
   * Custom text is never added to `items`.
   */
  allowCustom?: boolean;
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
};

function findOption(items: ComboboxOption[], value: string | null | undefined) {
  if (!value) return null;
  return items.find((option) => option.value === value) ?? null;
}

function Combobox({
  items,
  value,
  inputValue = "",
  onValueChange,
  onInputValueChange,
  allowCustom = false,
  placeholder,
  emptyMessage,
  disabled,
  id,
  name,
  className,
}: ComboboxProps) {
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);
  const popupScrollRef = useAllowPortaledMenuScroll(open);

  const selected = findOption(items, value);

  // When the user typed a custom value, keep a synthetic selection so Base UI
  // does not reset the input to "" on blur/close (single-select behavior).
  const resolvedSelected = useMemo(() => {
    if (selected) return selected;
    if (allowCustom && inputValue) {
      return { value: FREE_TEXT_VALUE, label: inputValue };
    }
    return null;
  }, [allowCustom, inputValue, selected]);

  const resolvedPlaceholder = placeholder ?? t("selectPlaceholder");
  const resolvedEmptyMessage = emptyMessage ?? t("noResults");

  // While open from typing, filter matches; when the query matches nothing,
  // still show the full fixed dropdown list if custom values are allowed.
  const listItems = useMemo(() => {
    const needle = inputValue.trim().toLowerCase();
    if (!needle) return items;

    const matches = items.filter((option) => option.label.toLowerCase().includes(needle));
    if (matches.length > 0) return matches;

    return allowCustom ? items : matches;
  }, [allowCustom, inputValue, items]);

  return (
    <BaseCombobox.Root<ComboboxOption>
      items={listItems}
      value={resolvedSelected}
      onValueChange={(option) => {
        if (!option || option.value === FREE_TEXT_VALUE) return;
        onValueChange?.(option.value);
        onInputValueChange?.(option.label);
        setOpen(false);
      }}
      inputValue={inputValue}
      onInputValueChange={(next, eventDetails) => {
        // Base UI clears the input when the popup closes without a list selection.
        // Keep free-typed text; only honor intentional clears from the user typing.
        if (
          allowCustom &&
          next === "" &&
          inputValue !== "" &&
          (eventDetails.reason === "input-clear" || eventDetails.reason === "none")
        ) {
          eventDetails.cancel();
          return;
        }

        onInputValueChange?.(next);
      }}
      itemToStringLabel={(option) => option?.label ?? ""}
      isItemEqualToValue={(a, b) => a?.value === b?.value}
      filter={null}
      open={open}
      onOpenChange={setOpen}
      name={name}
    >
      <BaseCombobox.InputGroup
        data-slot="combobox-input-group"
        className={cn(
          fieldControlClassName,
          "flex items-center gap-1 px-0 py-0",
          "data-[popup-open]:border-ring data-[popup-open]:ring-3 data-[popup-open]:ring-ring/50",
          className,
        )}
      >
        <BaseCombobox.Input
          id={id}
          disabled={disabled}
          placeholder={resolvedPlaceholder}
          className={cn(
            "h-full min-h-0 flex-1 border-0 bg-transparent px-2.5 shadow-none outline-none",
            "focus-visible:border-0 focus-visible:ring-0",
            fieldInvalidClassName,
          )}
        />
        <BaseCombobox.Trigger
          disabled={disabled}
          className="flex size-9 shrink-0 items-center justify-center text-muted-foreground outline-none hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
        >
          <BaseCombobox.Icon>
            <ChevronsUpDown className="size-4" />
          </BaseCombobox.Icon>
        </BaseCombobox.Trigger>
      </BaseCombobox.InputGroup>

      <BaseCombobox.Portal>
        <BaseCombobox.Positioner sideOffset={4} align="start" className="z-100">
          <BaseCombobox.Popup
            ref={(node) => {
              popupScrollRef.current = node;
            }}
            data-slot="combobox-content"
            className={cn(
              "flex w-(--anchor-width) max-h-72 max-w-(--available-width) flex-col overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-md outline-none",
              "origin-(--transform-origin) transition-[transform,opacity] data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0",
            )}
          >
            <BaseCombobox.Empty>
              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                {resolvedEmptyMessage}
              </div>
            </BaseCombobox.Empty>
            <BaseCombobox.List className="max-h-60 min-h-0 overflow-y-auto overscroll-contain p-1 data-empty:p-0">
              {(option: ComboboxOption) => (
                <BaseCombobox.Item
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
                  <BaseCombobox.ItemIndicator className="absolute end-2 flex items-center text-selected-foreground">
                    <Check className="size-4" />
                  </BaseCombobox.ItemIndicator>
                </BaseCombobox.Item>
              )}
            </BaseCombobox.List>
          </BaseCombobox.Popup>
        </BaseCombobox.Positioner>
      </BaseCombobox.Portal>
    </BaseCombobox.Root>
  );
}

export { Combobox };
