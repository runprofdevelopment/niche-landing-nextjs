"use client";

/**
 * Role permission flags for UI gating.
 *
 * Only the 4 CRUD keys are used for gating: activate/deactivate folds into
 * `canUpdate` and export folds into `canView` — there is no separate
 * `canChangeStatus`/`canExport` flag (same pattern as fleet/rent-to-own).
 *
 * Backend currently only exposes `role.view`; `role.create`/`update`/`delete`
 * aren't implemented server-side yet, so those fall back to `canView` to keep
 * the module operable until the backend adds them.
 */

import { ROLE_PERMISSIONS } from "@/constants/permissions";
import { useCanPermission } from "@/hooks/usePermission";

import type { PermissionKey } from "@/constants/permissions";

export function useRolePermissions() {
  const can = useCanPermission();
  const canView = can(ROLE_PERMISSIONS.view);

  const fallback = (permission: PermissionKey) => can(permission) || canView;

  return {
    canView,
    canCreate: fallback(ROLE_PERMISSIONS.create),
    canUpdate: fallback(ROLE_PERMISSIONS.update),
    canDelete: fallback(ROLE_PERMISSIONS.delete),
  };
}

export type RolePermissions = ReturnType<typeof useRolePermissions>;
