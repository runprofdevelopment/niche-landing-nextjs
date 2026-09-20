import { routes } from "@/constants/routes";

/**
 * FCM `data` payload contract for the staff dashboard.
 *
 * FCM data values are always strings. Backend should send:
 *
 * ```json
 * {
 *   "targetModule": "event",
 *   "targetId": "<eventId>"
 * }
 * ```
 *
 * Always opens the event details page (`/events/{targetId}`).
 * Notification title/body go in the FCM `notification` block (not `data`).
 */
export const FCM_TARGET_MODULES = ["event"] as const;

export type FcmTargetModule = (typeof FCM_TARGET_MODULES)[number];

export type FcmDataPayload = {
  /** Module that owns the destination screen. */
  targetModule: FcmTargetModule;
  /** Event id — opens `/events/{targetId}`. */
  targetId: string;
};

export function isFcmTargetModule(value: string): value is FcmTargetModule {
  return (FCM_TARGET_MODULES as readonly string[]).includes(value);
}

/**
 * Resolves an in-app path (no locale prefix) from an FCM data payload.
 * next-intl / middleware can add the locale; callers may also prefix locale themselves.
 */
export function resolveFcmRoute(data?: Record<string, string> | null): string | null {
  if (!data) return null;

  const targetModule = data["targetModule"]?.trim();
  const targetId = data["targetId"]?.trim();

  if (!targetModule || !targetId || !isFcmTargetModule(targetModule)) {
    return null;
  }

  return routes.event(targetId);
}
