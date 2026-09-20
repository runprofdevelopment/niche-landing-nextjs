const TIME_24_PATTERN = /^(\d{1,2}):(\d{2})(?::\d{2})?/;

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

export function formatTime24(date: Date | null | undefined): string | null {
  if (!date) return null;
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Accepts `H:mm`, `HH:mm`, or `HH:mm:ss` (API often returns seconds). */
export function parseTime24(value: string | null | undefined): Date | null {
  if (!value) return null;

  const trimmed = value.trim();
  const match = trimmed.match(TIME_24_PATTERN);
  if (match) {
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    if (hour > 23 || minute > 59) return null;
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date;
  }

  // ISO / Date-parsable fallback (e.g. full datetime strings from some APIs)
  const parsed = Date.parse(trimmed);
  if (Number.isNaN(parsed)) return null;
  const date = new Date(parsed);
  date.setSeconds(0, 0);
  return date;
}

export function formatTime12(date: Date | null | undefined): string | null {
  if (!date) return null;

  const hours24 = date.getHours();
  const period = hours24 >= 12 ? "PM" : "AM";
  const hour12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${pad(hour12)}:${pad(date.getMinutes())} ${period}`;
}
