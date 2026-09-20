"use client";

import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";
import { useCurrentLocale } from "@/providers/i18n";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";

const dateLocales = { en: enUS, ar } as const;

type DatePickerProps = {
  value: Date | null;
  onValueChange: (value: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Disables calendar days before this date (inclusive lower bound). */
  minDate?: Date;
  className?: string;
};

function DatePicker({
  value,
  onValueChange,
  placeholder,
  disabled = false,
  minDate,
  className,
}: DatePickerProps) {
  const t = useTranslations("dataTable");
  const locale = useCurrentLocale();
  const dateLocale = dateLocales[locale as keyof typeof dateLocales] ?? enUS;
  const minDay = minDate
    ? new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())
    : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-10 w-full min-w-0 justify-start overflow-hidden rounded-lg px-3 font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="me-2 size-4 shrink-0" />
          <span className="min-w-0 truncate">
            {value
              ? format(value, "PPP", { locale: dateLocale })
              : (placeholder ?? t("datePickPlaceholder"))}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value ?? undefined}
          onSelect={(date) => onValueChange(date ?? null)}
          disabled={minDay ? { before: minDay } : undefined}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export { DatePicker };
