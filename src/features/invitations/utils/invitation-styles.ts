/** Convert #RRGGBB to rgba() with alpha. Falls back to the original value. */
export function withAlpha(hex: string, alpha: number): string {
  const value = hex.replace("#", "").trim();
  if (value.length !== 6 || Number.isNaN(Number.parseInt(value, 16))) return hex;
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const DEFAULT_NAMES_FONT_SIZE = 48;
export const MIN_NAMES_FONT_SIZE = 28;
export const MAX_NAMES_FONT_SIZE = 72;
