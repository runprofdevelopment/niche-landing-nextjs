import { format, isValid, parse, parseISO } from "date-fns";
import { ar, enUS } from "date-fns/locale";

import { formatTime24, parseTime24 } from "@/shared/utils/time";

import type { InvitationLanguage } from "../types";

const DATE_LOCALES = { English: enUS, Arabic: ar } as const;

const DATE_PARSE_FORMATS = [
  "yyyy-MM-dd",
  "EEEE, d MMMM yyyy",
  "EEEE, MMMM d, yyyy",
  "d MMMM yyyy",
  "MMMM d, yyyy",
  "PPP",
] as const;

const TIME_12_PATTERN = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;

export function parseInvitationDateLine(value: string | null | undefined): Date | null {
  if (!value?.trim()) return null;
  const trimmed = value.trim();

  const isoDay = /^(\d{4}-\d{2}-\d{2})/.exec(trimmed)?.[1];
  if (isoDay) {
    try {
      const parsed = parseISO(isoDay);
      return isValid(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  for (const pattern of DATE_PARSE_FORMATS) {
    for (const locale of [enUS, ar]) {
      const parsed = parse(trimmed, pattern, new Date(), { locale });
      if (isValid(parsed)) return parsed;
    }
  }

  const fallback = Date.parse(trimmed);
  if (Number.isNaN(fallback)) return null;
  const date = new Date(fallback);
  return isValid(date) ? date : null;
}

export function formatInvitationDateLine(
  date: Date,
  language: InvitationLanguage | string | undefined = "English",
): string {
  const locale =
    language === "Arabic" || language === "ar" ? DATE_LOCALES.Arabic : DATE_LOCALES.English;
  return format(date, "EEEE, d MMMM yyyy", { locale });
}

export function parseInvitationTimeLine(value: string | null | undefined): Date | null {
  if (!value?.trim()) return null;
  const trimmed = value.trim();

  const match12 = TIME_12_PATTERN.exec(trimmed);
  if (match12) {
    let hour = Number(match12[1]);
    const minute = Number(match12[2]);
    const period = match12[3]?.toUpperCase();
    if (hour < 1 || hour > 12 || minute > 59) return null;
    if (period === "PM" && hour < 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date;
  }

  return parseTime24(trimmed);
}

export function formatInvitationTimeLine(date: Date): string {
  return formatTime24(date) ?? "";
}
