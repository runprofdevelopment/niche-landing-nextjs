import type { Channel, ErrorKind } from "./types";

/**
 * Where each error kind is delivered by default.
 *
 * - `toast`  — show a localized notification to the user.
 * - `report` — send to the active `errorReporter` (console in dev, Sentry in prod).
 *
 * Callers can override on a per-call basis via `handleError(err, { channels })`.
 */
export const DEFAULT_CHANNELS: Record<ErrorKind, Channel[]> = {
  auth: ["toast"],
  permission: ["toast"],
  validation: ["toast"],
  network: ["toast", "report"],
  api: ["toast", "report"],
  unknown: ["toast", "report"],
};
