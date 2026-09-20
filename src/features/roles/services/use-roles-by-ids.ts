"use client";

import { useMemo } from "react";

import { useRoleListQuery } from "../graphql";
import { mapRoleNodeToDetails } from "../graphql/mappers/role.mapper";

type UseRolesByIdsOptions = {
  ids: string[];
  skip?: boolean;
};

/** Loads several roles at once — used where an entity holds more than one role. */
export function useRolesByIds({ ids, skip }: UseRolesByIdsOptions) {
  const uniqueIds = useMemo(() => Array.from(new Set(ids.filter(Boolean))), [ids]);

  const { rows, loading, error, refetch } = useRoleListQuery({
    filters: uniqueIds.length > 0 ? { id: uniqueIds } : undefined,
    pagination: { limit: Math.max(uniqueIds.length, 1), page: 1 },
    skip: skip || uniqueIds.length === 0,
  });

  const roles = useMemo(() => rows.map(mapRoleNodeToDetails), [rows]);

  /** Deduplicated permission keys across every loaded role. */
  const permissionKeys = useMemo(
    () => Array.from(new Set(roles.flatMap((role) => role.permissionKeys))),
    [roles],
  );

  /** @deprecated Prefer `permissionKeys` — kept for staff details compatibility. */
  const permissionIds = permissionKeys;

  const permissionModuleNames = useMemo(
    () =>
      Array.from(new Set(roles.flatMap((role) => role.permissionModuleNames))).sort((left, right) =>
        left.localeCompare(right),
      ),
    [roles],
  );

  return {
    roles,
    permissionKeys,
    permissionIds,
    permissionModuleNames,
    loading,
    error,
    refetch,
  };
}
