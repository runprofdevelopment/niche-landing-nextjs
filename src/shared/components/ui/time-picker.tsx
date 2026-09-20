"use client";

/**
 * TimePicker — a text field that opens an hour/minute editor in a popover.
 * Built on Base UI's NumberField for the two numeric fields.
 *
 * `value`/`onValueChange` use `Date`s; callers convert with
 * `formatTime24`/`parseTime24` from `@/shared/utils`.
 *
 * `hourCycle="24"` shows/edits 00–23 (matches API payloads like `00:00` / `23:59`).
 * `hourCycle="12"` (default) uses AM/PM.
 */

import { NumberField } from "@base-ui/react/number-field";
import { Clock } from "lucide-react";
import { useState } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";
import { formatTime12, formatTime24 } from "@/shared/utils/time";

import { fieldInvalidClassName } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

import type { ComponentPropsWithoutRef } from "react";

type Period = "AM" | "PM";

type TimeParts12 = { hour: number; minute: number; period: Period };
type TimeParts24 = { hour: number; minute: number };

function toParts12(date: Date | null): TimeParts12 {
  if (!date) return { hour: 12, minute: 0, period: "AM" };
  const hours24 = date.getHours();
  const period: Period = hours24 >= 12 ? "PM" : "AM";
  const hour = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return { hour, minute: date.getMinutes(), period };
}

function toDate12(parts: TimeParts12, base: Date | null): Date {
  const date = base ? new Date(base) : new Date();
  let hours24 = parts.hour % 12;
  if (parts.period === "PM") hours24 += 12;
  date.setHours(hours24, parts.minute, 0, 0);
  return date;
}

function toParts24(date: Date | null): TimeParts24 {
  if (!date) return { hour: 0, minute: 0 };
  return { hour: date.getHours(), minute: date.getMinutes() };
}

function toDate24(parts: TimeParts24, base: Date | null): Date {
  const date = base ? new Date(base) : new Date();
  date.setHours(parts.hour, parts.minute, 0, 0);
  return date;
}

const numberFieldInputClassName =
  "h-9 w-12 rounded-md border border-border bg-input text-center text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

/** Rest props land on the trigger, so `FormControl` can pass `id` / `aria-*` through. */
type TimePickerProps = Omit<
  ComponentPropsWithoutRef<"button">,
  "value" | "defaultValue" | "onChange" | "children"
> & {
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (date: Date) => void;
  placeholder?: string;
  /** `"24"` shows 00–23 (API-friendly). Default `"12"` uses AM/PM. */
  hourCycle?: "12" | "24";
};

function TimePicker({
  value,
  defaultValue,
  onValueChange,
  placeholder,
  disabled,
  className,
  hourCycle = "12",
  ...props
}: TimePickerProps) {
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<Date | null>(defaultValue ?? null);
  const selected = value !== undefined ? value : internalValue;
  const is24 = hourCycle === "24";
  const parts12 = toParts12(selected);
  const parts24 = toParts24(selected);

  function commit(date: Date) {
    setInternalValue(date);
    onValueChange?.(date);
  }

  function updateParts12(next: Partial<TimeParts12>) {
    commit(toDate12({ ...parts12, ...next }, selected));
  }

  function updateParts24(next: Partial<TimeParts24>) {
    commit(toDate24({ ...parts24, ...next }, selected));
  }

  const display = selected
    ? is24
      ? (formatTime24(selected) ?? "")
      : (formatTime12(selected) ?? "")
    : (placeholder ?? t("selectTimePlaceholder"));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        disabled={disabled}
        className={cn(
          "flex h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-border bg-input px-2.5 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none",
          "data-[state=open]:border-ring focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          fieldInvalidClassName,
          selected ? "text-foreground" : "text-muted-foreground",
          className,
        )}
        {...props}
      >
        <span className="truncate">{display}</span>
        <Clock className="size-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) min-w-60 p-3" align="start">
        <div className="flex items-center justify-center gap-2">
          {is24 ? (
            <NumberField.Root
              min={0}
              max={23}
              value={parts24.hour}
              onValueChange={(next) => next !== null && updateParts24({ hour: next })}
            >
              <NumberField.Input className={numberFieldInputClassName} />
            </NumberField.Root>
          ) : (
            <NumberField.Root
              min={1}
              max={12}
              value={parts12.hour}
              onValueChange={(next) => next !== null && updateParts12({ hour: next })}
            >
              <NumberField.Input className={numberFieldInputClassName} />
            </NumberField.Root>
          )}
          <span className="text-sm font-semibold text-muted-foreground">:</span>
          <NumberField.Root
            min={0}
            max={59}
            step={1}
            value={is24 ? parts24.minute : parts12.minute}
            onValueChange={(next) => {
              if (next === null) return;
              if (is24) updateParts24({ minute: next });
              else updateParts12({ minute: next });
            }}
          >
            <NumberField.Input className={numberFieldInputClassName} />
          </NumberField.Root>
          {!is24 ? (
            <div className="ms-1 flex overflow-hidden rounded-md border border-border">
              {(["AM", "PM"] as const).map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => updateParts12({ period })}
                  className={cn(
                    "h-9 cursor-pointer px-2.5 text-xs font-medium transition-colors",
                    parts12.period === period
                      ? "bg-primary text-primary-foreground"
                      : "bg-transparent text-muted-foreground hover:bg-muted",
                  )}
                >
                  {period}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { TimePicker, type TimePickerProps };
