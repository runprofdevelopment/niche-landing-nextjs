"use client";

import { useMemo } from "react";

import { useRoleListQuery } from "../graphql";

import type { RoleFilterInput, RoleSortInput } from "../graphql";

type UseRolesOptions = {
  filters?: RoleFilterInput | undefined;
  limit?: number | undefined;
  pageNumber?: number | undefined;
  sort?: RoleSortInput[] | undefined;
  skip?: boolean | undefined;
};

export function useRoles(options: UseRolesOptions = {}) {
  const { filters, limit = 10, pageNumber = 1, sort, skip } = options;

  const { roles, pageInfo, totalCount, pageCount, loading, error, refetch } = useRoleListQuery({
    filters,
    pagination: { limit, page: pageNumber },
    sort,
    skip,
  });

  const legacyPageInfo = useMemo(
    () =>
      pageInfo
        ? {
            pagesCount: pageInfo.totalPagesCount,
            previousCursor: null as string | null,
            hasPreviousPage: pageInfo.hasPreviousPage,
            hasNextPage: pageInfo.hasNextPage,
          }
        : {
            pagesCount: pageCount,
            previousCursor: null as string | null,
            hasPreviousPage: false,
            hasNextPage: false,
          },
    [pageCount, pageInfo],
  );

  return {
    roles,
    totalCount,
    pageInfo: legacyPageInfo,
    pageCount,
    loading,
    error,
    refetch,
  };
}
