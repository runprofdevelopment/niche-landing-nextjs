"use client";

/**
 * Compatibility adapter for legacy staff/roles imports that expect
 * `useCanPermission()` to return a curried checker.
 *
 * The canonical hook lives in `@/hooks/usePermissions` and exposes `can(key)`
 * via `usePermissions()`. This file bridges callers that still import from
 * `@/hooks/usePermission` (singular).
 */

import { usePermissions } from "@/hooks/usePermissions";

export function useCanPermission() {
  const { can } = usePermissions();
  return can;
}

export { usePermissions };
export type { PermissionKey } from "@/constants/permissions";
