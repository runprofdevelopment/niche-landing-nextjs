"use client";

/**
 * Staff permission flags for UI gating.
 *
 * Only the 4 CRUD keys are used for gating: reassign role, activate/deactivate,
 * and approve a pending request all fold into `canUpdate`; export folds
 * into `canView` — there is no separate `canChangeStatus`/`canReassignRole`/
 * `canApprove`/`canExport` flag (same pattern as fleet/rent-to-own/roles).
 *
 * Backend currently only exposes `staff.view`; `staff.create`/`update`/`delete`
 * aren't implemented server-side yet, so those fall back to `canView` to keep
 * the module operable until the backend adds them.
 */

import { STAFF_PERMISSIONS } from "@/constants/permissions";
import { useCanPermission } from "@/hooks/usePermission";

import type { PermissionKey } from "@/constants/permissions";

export function useStaffPermissions() {
  const can = useCanPermission();
  const canView = can(STAFF_PERMISSIONS.view);

  const fallback = (permission: PermissionKey) => can(permission) || canView;

  return {
    canView,
    canCreate: fallback(STAFF_PERMISSIONS.create),
    canUpdate: fallback(STAFF_PERMISSIONS.update),
    canDelete: fallback(STAFF_PERMISSIONS.delete),
  };
}

export type StaffPermissions = ReturnType<typeof useStaffPermissions>;
