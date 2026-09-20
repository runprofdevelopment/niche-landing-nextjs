import type { HallObjectType, TableShape } from "../types";

export type ObjectPreset = {
  type: HallObjectType;
  label: string;
  category: "Venue" | "Areas" | "Decoration" | "Navigation";
  width: number;
  height: number;
  draw?: "polygon" | "path";
};

/** Designer library: tables plus these four layout objects (all drag-and-drop). */
export const OBJECT_PRESETS: ObjectPreset[] = [
  { type: "entrance", label: "Entrance", category: "Venue", width: 110, height: 48 },
  { type: "stage", label: "Stage", category: "Venue", width: 280, height: 80 },
  { type: "vip", label: "VIP Area", category: "Areas", width: 220, height: 160 },
  { type: "walkway", label: "Walkway", category: "Navigation", width: 320, height: 48 },
];

export const TABLE_PRESETS: Record<TableShape, { width: number; height: number; label: string }> = {
  round: { width: 90, height: 90, label: "Round Table" },
  rectangle: { width: 150, height: 80, label: "Rectangle Table" },
  square: { width: 90, height: 90, label: "Square Table" },
};

export type ObjectStyle = { fill: string; stroke: string; text: string };
export type CanvasColors = {
  pageBg: string;
  hallFill: string;
  hallStroke: string;
  grid: string;
  gridStrong: string;
  selection: string;
  invalid: string;
  seat: string;
  seatStroke: string;
  seatTaken: string;
  seatTakenStroke: string;
  seatTakenFill: string;
};

/**
 * Light-mode fallbacks (SSR / first paint). Runtime canvas colors come from
 * `resolveCanvasTheme()` so they track `:root` / `.dark` tokens in globals.css.
 */
export const CANVAS_COLORS: CanvasColors = {
  pageBg: "#fdf7f5",
  hallFill: "#fffbfa",
  hallStroke: "#e0c8c0",
  grid: "#edd9d3",
  gridStrong: "#e0c8c0",
  selection: "#602234",
  invalid: "#dc2626",
  seat: "#c0877d",
  seatStroke: "#602234",
  seatTaken: "#22c55e",
  seatTakenStroke: "#1ca24d",
  seatTakenFill: "rgba(34,197,94,0.28)",
};

export const OBJECT_STYLE: Record<string, ObjectStyle> = {
  table: { fill: "rgba(96,34,52,0.14)", stroke: "#602234", text: "#602234" },
  stage: { fill: "#602234", stroke: "#602234", text: "#fffaf3" },
  entrance: { fill: "rgba(96,34,52,0.06)", stroke: "#602234", text: "#602234" },
  exit: { fill: "rgba(96,34,52,0.06)", stroke: "#602234", text: "#602234" },
  vip: { fill: "#edd9d3", stroke: "#602234", text: "#602234" },
  restricted: { fill: "rgba(255,97,100,0.15)", stroke: "#ff6164", text: "#7a2c2c" },
  dining: { fill: "#eee3df", stroke: "#c0877d", text: "#2d1a1e" },
  "dance-floor": { fill: "#fffbfa", stroke: "#c0877d", text: "#602234" },
  buffet: { fill: "#efe2de", stroke: "#602234", text: "#602234" },
  dj: { fill: "#efe2de", stroke: "#602234", text: "#602234" },
  screen: { fill: "#eee3df", stroke: "#7a6560", text: "#2d1a1e" },
  decoration: { fill: "#f3e5ea", stroke: "#c0877d", text: "#602234" },
  flowers: { fill: "#f3e5ea", stroke: "#c0877d", text: "#602234" },
  cake: { fill: "#f3e5ea", stroke: "#c0877d", text: "#602234" },
  "photo-area": { fill: "#f3e5ea", stroke: "#c0877d", text: "#602234" },
  walkway: { fill: "#f7f0eb", stroke: "#c0877d", text: "#602234" },
};

export type CanvasTheme = {
  canvas: CanvasColors;
  objectStyle: Record<string, ObjectStyle>;
};

function readVar(styles: CSSStyleDeclaration, name: string, fallback: string): string {
  return styles.getPropertyValue(name).trim() || fallback;
}

/** Force a CSS color through the browser so Konva gets rgb/rgba/hex it can paint. */
function resolveColor(value: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const el = document.createElement("div");
  el.style.color = value;
  document.body.appendChild(el);
  const resolved = getComputedStyle(el).color;
  el.remove();
  return resolved || fallback;
}

function withAlpha(color: string, alpha: number): string {
  const match = /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i.exec(color);
  if (!match) return color;
  return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${alpha})`;
}

function themeColor(
  styles: CSSStyleDeclaration,
  name: string,
  fallback: string,
  alpha?: number,
): string {
  const raw = readVar(styles, name, fallback);
  const resolved = resolveColor(raw, fallback);
  return alpha != null ? withAlpha(resolved, alpha) : resolved;
}

/** Build Konva-safe palette from current CSS theme tokens. */
export function resolveCanvasTheme(): CanvasTheme {
  if (typeof document === "undefined") {
    return { canvas: CANVAS_COLORS, objectStyle: OBJECT_STYLE };
  }

  const styles = getComputedStyle(document.documentElement);

  const primary = themeColor(styles, "--primary", CANVAS_COLORS.selection);
  const primaryFg = themeColor(styles, "--primary-foreground", "#fffaf3");
  const secondary = themeColor(styles, "--secondary", CANVAS_COLORS.seat);
  const foreground = themeColor(styles, "--foreground", "#2d1a1e");
  const muted = themeColor(styles, "--muted", "#eee3df");
  const mutedFg = themeColor(styles, "--muted-foreground", "#7a6560");
  const accent = themeColor(styles, "--accent", "#edd9d3");
  const border = themeColor(styles, "--border", CANVAS_COLORS.hallStroke);
  const background = themeColor(styles, "--background", CANVAS_COLORS.pageBg);
  const card = themeColor(styles, "--card", CANVAS_COLORS.hallFill);
  const outline = themeColor(styles, "--outline", primary);
  const secondaryButton = themeColor(styles, "--secondary-button", "#efe2de");
  const destructive = themeColor(styles, "--destructive", "#ff6164");
  const error = themeColor(styles, "--error", CANVAS_COLORS.invalid);
  const activeFg = themeColor(styles, "--active-foreground", CANVAS_COLORS.seatTaken);
  const success = themeColor(styles, "--success", CANVAS_COLORS.seatTakenStroke);

  const canvas: CanvasColors = {
    pageBg: background,
    hallFill: card,
    hallStroke: border,
    grid: accent,
    gridStrong: border,
    selection: primary,
    invalid: error,
    seat: secondary,
    seatStroke: outline,
    seatTaken: activeFg,
    seatTakenStroke: success,
    seatTakenFill: withAlpha(activeFg, 0.28),
  };

  const objectStyle: Record<string, ObjectStyle> = {
    table: { fill: withAlpha(primary, 0.14), stroke: outline, text: outline },
    stage: { fill: primary, stroke: primary, text: primaryFg },
    entrance: { fill: withAlpha(primary, 0.06), stroke: outline, text: outline },
    exit: { fill: withAlpha(primary, 0.06), stroke: outline, text: outline },
    vip: { fill: accent, stroke: outline, text: foreground },
    restricted: { fill: withAlpha(destructive, 0.15), stroke: destructive, text: destructive },
    dining: { fill: muted, stroke: secondary, text: foreground },
    "dance-floor": { fill: card, stroke: secondary, text: outline },
    buffet: { fill: secondaryButton, stroke: outline, text: outline },
    dj: { fill: secondaryButton, stroke: outline, text: outline },
    screen: { fill: muted, stroke: mutedFg, text: foreground },
    decoration: { fill: accent, stroke: secondary, text: outline },
    flowers: { fill: accent, stroke: secondary, text: outline },
    cake: { fill: accent, stroke: secondary, text: outline },
    "photo-area": { fill: accent, stroke: secondary, text: outline },
    walkway: { fill: muted, stroke: secondary, text: outline },
  };

  return { canvas, objectStyle };
}
