"use client";

import { REGISTRATION_USERS_PERMISSIONS } from "@/constants/permissions";
import { useCanPermission } from "@/hooks/usePermission";

export function useRegistrationUsersPermissions() {
  const can = useCanPermission();
  const canView = can(REGISTRATION_USERS_PERMISSIONS.view);
  const canUpdate = can(REGISTRATION_USERS_PERMISSIONS.update) || canView;

  return {
    canView,
    canUpdate,
  };
}

export type RegistrationUsersPermissions = ReturnType<typeof useRegistrationUsersPermissions>;
