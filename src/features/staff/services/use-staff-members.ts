"use client";

import { useMemo } from "react";

import { useStaffUserListQuery } from "../graphql";

import type { StaffTab } from "../constants";
import type { StaffUserFilterInput, StaffUserSortInput } from "../graphql";

type UseStaffMembersOptions = {
  tab?: StaffTab | undefined;
  filters?: StaffUserFilterInput | undefined;
  limit?: number | undefined;
  pageNumber?: number | undefined;
  sort?: StaffUserSortInput[] | undefined;
  skip?: boolean | undefined;
};

export function useStaffMembers(options: UseStaffMembersOptions = {}) {
  const { tab, filters, limit = 10, pageNumber = 1, sort, skip } = options;

  const { staff, pageInfo, totalCount, pageCount, loading, error, refetch } = useStaffUserListQuery(
    {
      tab,
      filters,
      pagination: { limit, page: pageNumber },
      sort,
      skip,
    },
  );

  const legacyPageInfo = useMemo(
    () =>
      pageInfo
        ? {
            pagesCount: pageCount,
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
    staff,
    totalCount,
    pageInfo: legacyPageInfo,
    pageCount,
    loading,
    error,
    refetch,
  };
}
