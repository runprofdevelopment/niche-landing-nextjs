"use client";

import { format, setMonth, setYear } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";
import { useCurrentLocale } from "@/providers/i18n";
import { Button } from "@/shared/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";

import { fieldInvalidClassName } from "./input";

const dateLocales = { en: enUS, ar } as const;

type MonthPickerProps = {
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (value: Date | null) => void;
  placeholder?: string;
  variant?: "default" | "ghost";
  disabled?: boolean;
  className?: string;
};

function MonthPicker({
  value,
  defaultValue,
  onValueChange,
  placeholder,
  variant = "default",
  disabled = false,
  className,
}: MonthPickerProps) {
  const t = useTranslations("common");
  const locale = useCurrentLocale();
  const dateLocale = dateLocales[locale as keyof typeof dateLocales] ?? enUS;
  const [internalValue, setInternalValue] = useState<Date | null>(defaultValue ?? null);
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() =>
    (value ?? defaultValue ?? new Date()).getFullYear(),
  );

  const selected = value !== undefined ? value : internalValue;

  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => {
        const date = new Date(viewYear, index, 1);
        return {
          index,
          label: format(date, "MMM", { locale: dateLocale }),
          date,
        };
      }),
    [dateLocale, viewYear],
  );

  const selectMonth = (monthIndex: number) => {
    const next = setMonth(setYear(new Date(), viewYear), monthIndex);
    if (value === undefined) setInternalValue(next);
    onValueChange?.(next);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant={variant === "ghost" ? "ghost" : "outline"}
          disabled={disabled}
          className={cn(
            "h-10 w-full justify-start rounded-lg px-3 font-normal",
            !selected && "text-muted-foreground",
            fieldInvalidClassName,
            className,
          )}
        >
          <CalendarIcon className="me-2 size-4" />
          {selected
            ? format(selected, "MMMM yyyy", { locale: dateLocale })
            : (placeholder ?? t("monthPickPlaceholder"))}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <div className="mb-3 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setViewYear((year) => year - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm font-medium">{viewYear}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setViewYear((year) => year + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {months.map((month) => {
            const isSelected =
              selected &&
              selected.getFullYear() === viewYear &&
              selected.getMonth() === month.index;

            return (
              <Button
                key={month.index}
                type="button"
                variant={isSelected ? "default" : "outline"}
                className="h-9"
                onClick={() => selectMonth(month.index)}
              >
                {month.label}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { MonthPicker, type MonthPickerProps };
