import type { TimelineSlot, TimelineStatus } from "../types";
import type { badgeVariants } from "@/shared/components/ui/badge";
import type { VariantProps } from "class-variance-authority";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

export const TIMELINE_STATUS_OPTIONS: TimelineStatus[] = ["pending", "in-progress", "completed"];

export const TIMELINE_STATUS_BADGE_VARIANT: Record<TimelineStatus, BadgeVariant> = {
  pending: "secondary",
  "in-progress": "selected",
  completed: "success",
};

export const TIMELINE_STATUS_LABEL_KEYS: Record<TimelineStatus, string> = {
  pending: "timelineStatusPending",
  "in-progress": "timelineStatusInProgress",
  completed: "timelineStatusCompleted",
};

/** Rail marker fill — completed green, in-progress brand, pending muted. */
export const TIMELINE_STATUS_DOT_CLASS: Record<TimelineStatus, string> = {
  pending: "bg-secondary",
  "in-progress": "bg-primary",
  completed: "bg-active-foreground",
};

const MINUTES_IN_DAY = 24 * 60;

function toMinutes(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?/.exec(time.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** Minutes between two "HH:mm" times, rolling past midnight when end <= start. */
export function getSlotDurationMinutes(start: string, end: string): number | null {
  const from = toMinutes(start);
  const to = toMinutes(end);
  if (from == null || to == null) return null;
  return to > from ? to - from : to + MINUTES_IN_DAY - from;
}

function combineEventDateTime(eventDate: string, timeHm: string): Date | null {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(eventDate.trim());
  const minutes = toMinutes(timeHm);
  if (!dateMatch || minutes == null) return null;

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const date = new Date(year, month - 1, day, hours, mins, 0, 0);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Derives slot status from start/end vs "now".
 * When `eventDate` is provided, compares full datetimes (overnight end rolls to next day).
 * Otherwise compares clock minutes on the current day.
 */
export function resolveTimelineStatus(
  start: string,
  end: string,
  options?: { eventDate?: string; now?: Date },
): TimelineStatus {
  const now = options?.now ?? new Date();
  const eventDate = options?.eventDate;

  if (eventDate) {
    const startAt = combineEventDateTime(eventDate, start);
    let endAt = combineEventDateTime(eventDate, end);
    if (!startAt || !endAt) return "pending";
    if (endAt.getTime() <= startAt.getTime()) {
      endAt = new Date(endAt.getTime() + MINUTES_IN_DAY * 60_000);
    }
    if (now.getTime() < startAt.getTime()) return "pending";
    if (now.getTime() < endAt.getTime()) return "in-progress";
    return "completed";
  }

  const startMinutes = toMinutes(start);
  const endMinutes = toMinutes(end);
  if (startMinutes == null || endMinutes == null) return "pending";

  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  if (endMinutes > startMinutes) {
    if (nowMinutes < startMinutes) return "pending";
    if (nowMinutes < endMinutes) return "in-progress";
    return "completed";
  }

  // Overnight window (e.g. 22:00 → 02:00). Without an event date, the daytime
  // gap is treated as pending (prefer passing `eventDate` for accurate status).
  if (nowMinutes >= startMinutes || nowMinutes < endMinutes) return "in-progress";
  return "pending";
}

/** Chronological order by start time, matching the run-of-show rail. */
export function sortTimelineSlots(slots: TimelineSlot[]): TimelineSlot[] {
  return slots.slice().sort((a, b) => a.start.localeCompare(b.start));
}
