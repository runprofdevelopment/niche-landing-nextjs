"use client";

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { routes } from "@/constants/routes";
import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";
import { Link, useCurrentLocale } from "@/providers/i18n";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

import type { EventRecord } from "@/features/events/types";

const dateLocales = { en: enUS, ar } as const;

type DashboardCalendarProps = {
  events: EventRecord[];
};

function formatEventTime(time: string, locale: string) {
  if (!time) return time;
  const [hours, minutes] = time.split(":").map(Number);
  if (hours == null || minutes == null || Number.isNaN(hours) || Number.isNaN(minutes)) {
    return time;
  }
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }).format(date);
}

export function DashboardCalendar({ events }: DashboardCalendarProps) {
  const t = useTranslations("dashboard");
  const locale = useCurrentLocale();
  const dateLocale = dateLocales[locale as keyof typeof dateLocales] ?? enUS;

  const [viewDate, setViewDate] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const weekDayLabels = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + index);
      return format(day, "EEEEEE", { locale: dateLocale });
    });
  }, [dateLocale]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(viewDate);
    return eachDayOfInterval({
      start: startOfWeek(monthStart, { weekStartsOn: 0 }),
      end: endOfWeek(monthEnd, { weekStartsOn: 0 }),
    });
  }, [viewDate]);

  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => {
        const date = new Date(viewDate.getFullYear(), index, 1);
        return {
          index,
          label: format(date, "MMMM", { locale: dateLocale }),
        };
      }),
    [dateLocale, viewDate],
  );

  const selectedDayEvents = useMemo(
    () =>
      events
        .filter((event) => {
          if (!event.date) return false;
          const eventDate = new Date(`${event.date}T00:00:00`);
          return isSameDay(eventDate, selectedDate);
        })
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [events, selectedDate],
  );

  const daysWithEvents = useMemo(() => {
    const set = new Set<string>();
    for (const event of events) {
      if (event.date) set.add(event.date);
    }
    return set;
  }, [events]);

  const monthLabel = format(viewDate, "MMMM yyyy", { locale: dateLocale });
  const selectedDayLabel = format(selectedDate, "MMM d, yyyy", { locale: dateLocale });
  const isSelectedToday = isSameDay(selectedDate, new Date());

  return (
    <Card className="border-border/60 bg-card shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            aria-label={t("previousMonth")}
            onClick={() => setViewDate((current) => subMonths(current, 1))}
          >
            <ChevronLeft className="size-4 rtl:rotate-180" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="h-8 min-w-0 flex-1 px-2 font-medium"
                aria-label={t("selectMonth")}
              >
                <CardTitle className="truncate text-base font-medium">{monthLabel}</CardTitle>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="max-h-72 w-44 overflow-y-auto">
              {months.map((month) => (
                <DropdownMenuItem
                  key={month.index}
                  onSelect={() => setViewDate(new Date(viewDate.getFullYear(), month.index, 1))}
                >
                  {month.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            aria-label={t("nextMonth")}
            onClick={() => setViewDate((current) => addMonths(current, 1))}
          >
            <ChevronRight className="size-4 rtl:rotate-180" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
          {weekDayLabels.map((day, index) => (
            <span key={`${day}-${index}`}>{day}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-sm">
          {calendarDays.map((day) => {
            const inMonth = isSameMonth(day, viewDate);
            const selected = isSameDay(day, selectedDate);
            const today = isSameDay(day, new Date());
            const key = format(day, "yyyy-MM-dd");
            const hasEvents = daysWithEvents.has(key);

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedDate(day)}
                className={cn(
                  "relative mx-auto flex size-8 items-center justify-center rounded-full transition-colors",
                  !inMonth && "text-muted-foreground/40",
                  inMonth && !selected && "text-foreground/80 hover:bg-muted",
                  selected && "bg-primary text-primary-foreground hover:bg-primary",
                  !selected && today && "ring-1 ring-primary/40",
                )}
              >
                {format(day, "d")}
                {hasEvents ? (
                  <span
                    className={cn(
                      "absolute bottom-0.5 size-1 rounded-full",
                      selected ? "bg-primary-foreground" : "bg-primary",
                    )}
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">
            {isSelectedToday ? t("todayEvents") : t("eventsOnDay", { date: selectedDayLabel })}
          </p>
          {selectedDayEvents.length === 0 ? (
            <p className="rounded-lg bg-muted/60 px-3 py-4 text-center text-sm text-muted-foreground">
              {t("noEventsForDay")}
            </p>
          ) : (
            <div className="space-y-2">
              {selectedDayEvents.map((event) => (
                <Link
                  key={event.id}
                  href={routes.event(event.id)}
                  className="flex items-center gap-3 rounded-lg bg-muted/60 px-3 py-2 text-sm transition-colors hover:bg-muted"
                >
                  <span className="shrink-0 font-medium text-primary">
                    {formatEventTime(event.startTime, locale)}
                  </span>
                  <span className="truncate">{event.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
