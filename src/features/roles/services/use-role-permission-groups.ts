"use client";

import { useMemo } from "react";

import { getPermissionModules } from "../domain/permission-catalog";

export function useRolePermissionGroups() {
  const modules = useMemo(() => getPermissionModules(), []);

  return { modules, loading: false, refetch: async () => ({ data: undefined }) as const };
}
