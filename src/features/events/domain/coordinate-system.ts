/**
 * Designer workspace size (logical units) — not the physical hall size.
 * Real hall size lives on boundary.widthMeters / heightMeters.
 * Always send on EventHallCreate; clients read it back from find/list.
 */
export const COORDINATE_SYSTEM = { width: 1400, height: 900 } as const;

export type CoordinateSystem = {
  width: number;
  height: number;
};

/** Pre-meters halls used ~40 logical units per meter (lossy when clamped). */
const LEGACY_UNITS_PER_METER = 40;

/**
 * Fit real-world meters into the designer workspace with a uniform scale
 * so aspect ratio is preserved (scaleX === scaleY).
 *
 * Example: 30m × 60m inside 1400×900 → scale 15 → 450×900.
 */
export function fitMetersToWorkspace(
  widthMeters: number,
  heightMeters: number,
  workspace: CoordinateSystem = COORDINATE_SYSTEM,
): { width: number; height: number; scale: number } {
  const wM = Math.max(0.1, widthMeters);
  const hM = Math.max(0.1, heightMeters);
  const scale = Math.min(workspace.width / wM, workspace.height / hM);
  return {
    width: Math.max(1, Math.round(wM * scale)),
    height: Math.max(1, Math.round(hM * scale)),
    scale,
  };
}

/** Fallback when API boundary has no meters (legacy halls). */
export function legacyUnitsToMeters(units: number): number {
  return Math.round((units / LEGACY_UNITS_PER_METER) * 10) / 10;
}
