/**
 * Abaya label codes are `{prefix}-{number}-{suffix}`, e.g. `ABY-001-2024`.
 * The number is zero-padded so labels sort naturally when printed.
 */

export const ABAYA_LABEL_MIN_DIGITS = 3;

/** Caps how many labels one batch can hold, so the preview grid stays usable. */
export const ABAYA_LABEL_MAX_COUNT = 2000;

/** Placeholder values the preview falls back to before anything is typed. */
export const ABAYA_LABEL_SAMPLE = {
  prefix: "ABY",
  suffix: "2024",
  from: 1,
  to: 100,
} as const;

export type AbayaLabelConfig = {
  prefix: string;
  suffix: string;
  from: number;
  to: number;
};

/** Wide enough for the highest number in the range, never below three digits. */
export function abayaLabelDigits(to: number): number {
  return Math.max(ABAYA_LABEL_MIN_DIGITS, String(Math.max(0, Math.trunc(to))).length);
}

/** Strip cosmetic edge separators — dashes are added by the formatter. */
export function normalizeAbayaSegment(value: string): string {
  return value.trim().replace(/^[-_/\s]+|[-_/\s]+$/g, "");
}

export function formatAbayaLabel(config: AbayaLabelConfig, value: number): string {
  const prefix = normalizeAbayaSegment(config.prefix);
  const suffix = normalizeAbayaSegment(config.suffix);
  const padded = String(Math.trunc(value)).padStart(abayaLabelDigits(config.to), "0");

  if (!suffix) return `${prefix}-${padded}`;
  return `${prefix}-${padded}-${suffix}`;
}

export function abayaLabelCount(config: AbayaLabelConfig): number {
  return Math.max(0, Math.trunc(config.to) - Math.trunc(config.from) + 1);
}

export function abayaLabelCodes(config: AbayaLabelConfig): string[] {
  const count = Math.min(abayaLabelCount(config), ABAYA_LABEL_MAX_COUNT);
  return Array.from({ length: count }, (_, index) =>
    formatAbayaLabel(config, Math.trunc(config.from) + index),
  );
}

/** Badge shows the suffix segment without leading separators. */
export function abayaSuffixBadge(suffix: string): string {
  return normalizeAbayaSegment(suffix);
}
