"use client";

import { useQuery } from "@apollo/client";
import { useMemo } from "react";

import { isActiveStaffUser, mapStaffUserToMemberRecord } from "../mappers/staff-user.mapper";
import {
  STAFF_USER_LIST_QUERY,
  hasStaffUserListFilters,
  type StaffUserFilterInput,
  type StaffUserListQueryData,
  type StaffUserListQueryVariables,
  type StaffUserPaginationInput,
  type StaffUserSortInput,
} from "../queries/user-list";

import type { StaffTab } from "../../constants";

/** Fetch a wider window so client-side active/pending splits still fill the table. */
const TAB_FETCH_LIMIT = 200;

type UseStaffUserListQueryOptions = {
  tab?: StaffTab | undefined;
  sort?: StaffUserSortInput[] | null | undefined;
  pagination?: StaffUserPaginationInput | null | undefined;
  filters?: StaffUserFilterInput | null | undefined;
  skip?: boolean | undefined;
};

export function useStaffUserListQuery(options: UseStaffUserListQueryOptions = {}) {
  const { tab, sort, pagination, filters, skip = false } = options;
  const pageSize = pagination?.limit ?? 10;
  const page = pagination?.page ?? 1;

  const variables = useMemo<StaffUserListQueryVariables>(() => {
    // When splitting by tab (roleIds / isOwner), load a larger page then slice locally.
    const serverPagination = tab
      ? { limit: TAB_FETCH_LIMIT, page: 1 }
      : pagination
        ? pagination
        : undefined;

    return {
      ...(sort && sort.length > 0 ? { sort } : {}),
      ...(serverPagination ? { pagination: serverPagination } : {}),
      ...(hasStaffUserListFilters(filters) ? { filters } : {}),
    };
  }, [filters, pagination, sort, tab]);

  const { data, loading, error, refetch, networkStatus } = useQuery<
    StaffUserListQueryData,
    StaffUserListQueryVariables
  >(STAFF_USER_LIST_QUERY, {
    variables,
    skip,
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const { staff, totalCount, pageCount } = useMemo(() => {
    const allRows = data?.userList?.rows ?? [];
    const filteredRows = tab
      ? allRows.filter((row) => {
          const isActive = isActiveStaffUser(row);
          return tab === "active" ? isActive : !isActive;
        })
      : allRows;

    const mapped = filteredRows.map(mapStaffUserToMemberRecord);

    if (!tab) {
      const info = data?.userList?.pageInfo ?? null;
      return {
        staff: mapped,
        totalCount: info?.totalCount ?? mapped.length,
        pageCount: Math.max(1, info?.totalPagesCount ?? 1),
      };
    }

    const start = Math.max(0, (page - 1) * pageSize);
    const pageRows = mapped.slice(start, start + pageSize);
    return {
      staff: pageRows,
      totalCount: mapped.length,
      pageCount: Math.max(1, Math.ceil(mapped.length / pageSize) || 1),
    };
  }, [data, page, pageSize, tab]);

  const pageInfo = data?.userList?.pageInfo ?? null;

  return {
    staff,
    rows: data?.userList?.rows ?? [],
    pageInfo,
    totalCount,
    pageCount,
    loading,
    error,
    refetch,
    networkStatus,
  };
}
