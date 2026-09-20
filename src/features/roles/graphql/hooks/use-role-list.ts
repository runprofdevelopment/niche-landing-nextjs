"use client";

import { useQuery } from "@apollo/client";
import { useMemo } from "react";

import { mapRoleNodeToListItem } from "../mappers/role.mapper";
import {
  ROLE_LIST_QUERY,
  hasRoleListFilters,
  type RoleFilterInput,
  type RoleListQueryData,
  type RoleListQueryVariables,
  type RolePaginationInput,
  type RoleSortInput,
} from "../queries/role-list";

type UseRoleListQueryOptions = {
  sort?: RoleSortInput[] | null | undefined;
  pagination?: RolePaginationInput | null | undefined;
  filters?: RoleFilterInput | null | undefined;
  skip?: boolean | undefined;
};

export function useRoleListQuery(options: UseRoleListQueryOptions = {}) {
  const { sort, pagination, filters, skip = false } = options;

  const variables = useMemo<RoleListQueryVariables>(
    () => ({
      ...(sort && sort.length > 0 ? { sort } : {}),
      ...(pagination ? { pagination } : {}),
      ...(hasRoleListFilters(filters) ? { filters } : {}),
    }),
    [filters, pagination, sort],
  );

  const { data, loading, error, refetch, networkStatus } = useQuery<
    RoleListQueryData,
    RoleListQueryVariables
  >(ROLE_LIST_QUERY, {
    variables,
    skip,
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const roles = useMemo(() => (data?.roleList?.rows ?? []).map(mapRoleNodeToListItem), [data]);

  const pageInfo = data?.roleList?.pageInfo ?? null;
  const totalCount = pageInfo?.totalCount ?? 0;
  const pageCount = Math.max(1, pageInfo?.totalPagesCount ?? 1);

  return {
    roles,
    rows: data?.roleList?.rows ?? [],
    pageInfo,
    totalCount,
    pageCount,
    loading,
    error,
    refetch,
    networkStatus,
  };
}
