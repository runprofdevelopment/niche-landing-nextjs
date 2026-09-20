"use client";

import { useCallback, useMemo, useState } from "react";

import { getPermissionCatalogItems } from "../domain/permission-catalog";

import type { RolePermissionOverview } from "../types";

type CatalogFilters = {
  keys?: string[] | undefined;
  keyContains?: string | undefined;
  moduleName?: string | undefined;
};

type UseRolePermissionsCatalogOptions = {
  /** Limit results to these permission keys (role / staff audit). */
  keys?: string[] | undefined;
  keyContains?: string | undefined;
  moduleName?: string | undefined;
  limit?: number | undefined;
  pageNumber?: number | undefined;
  sort?: Array<{ field: string; order: "asc" | "desc" }> | undefined;
  skip?: boolean | undefined;
};

function applyFilters(
  items: RolePermissionOverview[],
  filters: CatalogFilters,
): RolePermissionOverview[] {
  let next = items;

  if (filters.keys && filters.keys.length > 0) {
    const wanted = new Set(filters.keys);
    next = next.filter((item) => wanted.has(item.key));
  }

  if (filters.keyContains?.trim()) {
    const query = filters.keyContains.trim().toLowerCase();
    next = next.filter((item) => item.key.toLowerCase().includes(query));
  }

  if (filters.moduleName?.trim()) {
    const moduleName = filters.moduleName.trim().toLowerCase();
    next = next.filter((item) => item.moduleName.toLowerCase() === moduleName);
  }

  return next;
}

function applySort(
  items: RolePermissionOverview[],
  sort: UseRolePermissionsCatalogOptions["sort"],
): RolePermissionOverview[] {
  if (!sort || sort.length === 0) {
    return [...items].sort((left, right) => left.key.localeCompare(right.key));
  }

  const [{ field, order } = { field: "key", order: "asc" as const }] = sort;
  const direction = order === "desc" ? -1 : 1;

  return [...items].sort((left, right) => {
    const leftValue = String(
      field === "module" || field === "moduleName"
        ? left.moduleName
        : field === "action" || field === "description"
          ? left.description
          : field === "id"
            ? left.id
            : left.key,
    );
    const rightValue = String(
      field === "module" || field === "moduleName"
        ? right.moduleName
        : field === "action" || field === "description"
          ? right.description
          : field === "id"
            ? right.id
            : right.key,
    );
    return leftValue.localeCompare(rightValue) * direction;
  });
}

export function useRolePermissionsCatalog(options: UseRolePermissionsCatalogOptions = {}) {
  const { keys, keyContains, moduleName, limit = 100, pageNumber = 1, sort, skip } = options;
  const [refreshTick, setRefreshTick] = useState(0);

  const { permissions, totalCount, pageInfo } = useMemo(() => {
    if (skip) {
      return {
        permissions: [] as RolePermissionOverview[],
        totalCount: 0,
        pageInfo: {
          pagesCount: 0,
          previousCursor: null as string | null,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      };
    }

    const filtered = applyFilters(getPermissionCatalogItems(), {
      keys,
      keyContains,
      moduleName,
    });
    const sorted = applySort(filtered, sort);
    const start = Math.max(0, (pageNumber - 1) * limit);
    const page = sorted.slice(start, start + limit);
    const pagesCount = Math.max(1, Math.ceil(sorted.length / limit) || 1);

    return {
      permissions: page,
      totalCount: sorted.length,
      pageInfo: {
        pagesCount,
        previousCursor: null as string | null,
        hasPreviousPage: pageNumber > 1,
        hasNextPage: start + limit < sorted.length,
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refreshTick forces rebuild when catalog source changes
  }, [keys, keyContains, moduleName, limit, pageNumber, sort, skip, refreshTick]);

  const refetch = useCallback(async () => {
    setRefreshTick((tick) => tick + 1);
    return { data: undefined } as const;
  }, []);

  return { permissions, totalCount, pageInfo, loading: false, refetch };
}
