"use client";

import { useCallback, useMemo } from "react";

import { ALL_PERMISSION_KEYS, type PermissionKey } from "@/constants/permissions";
import { useAuth } from "@/providers/auth";

export type CrudAction = "view" | "create" | "update" | "delete";

/**
 * Permission helpers for views and mutations.
 * - `can("guest.create")` — exact key
 * - `canView("guest")` / `canAdd("guest")` / `canEdit("guest")` / `canDelete("guest")`
 *
 * Admin (`staff` + `isOwner`) bypasses checks.
 * Non-owners use `profile.permissions` only (empty ⇒ no access).
 */
export function usePermissions() {
  const { permissions, isAdmin } = useAuth();

  const can = useCallback(
    (key: PermissionKey) => {
      if (isAdmin) return true;
      return permissions.has(key);
    },
    [isAdmin, permissions],
  );

  const canView = useCallback(
    (resource: string) => can(`${resource}.view` as PermissionKey),
    [can],
  );
  const canCreate = useCallback(
    (resource: string) => can(`${resource}.create` as PermissionKey),
    [can],
  );
  /** Alias of canCreate — common UI wording for “Add”. */
  const canAdd = canCreate;
  const canUpdate = useCallback(
    (resource: string) => can(`${resource}.update` as PermissionKey),
    [can],
  );
  /** Alias of canUpdate — common UI wording for “Edit”. */
  const canEdit = canUpdate;
  const canDelete = useCallback(
    (resource: string) => can(`${resource}.delete` as PermissionKey),
    [can],
  );

  const canCrud = useCallback(
    (resource: string, action: CrudAction) => {
      switch (action) {
        case "view":
          return canView(resource);
        case "create":
          return canCreate(resource);
        case "update":
          return canUpdate(resource);
        case "delete":
          return canDelete(resource);
        default:
          return false;
      }
    },
    [canCreate, canDelete, canUpdate, canView],
  );

  return useMemo(
    () => ({
      can,
      canView,
      canCreate,
      canAdd,
      canUpdate,
      canEdit,
      canDelete,
      canCrud,
      permissions,
      isAdmin,
      allKeys: ALL_PERMISSION_KEYS,
    }),
    [can, canAdd, canCreate, canCrud, canDelete, canEdit, canUpdate, canView, isAdmin, permissions],
  );
}

/** Single-key check for nav / buttons. */
export function useCanPermission(key: PermissionKey) {
  const { can } = usePermissions();
  return can(key);
}
