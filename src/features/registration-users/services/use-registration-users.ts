"use client";

import { useGuestListQuery } from "../graphql";

import type { GuestUserFilterInput, GuestUserSortInput } from "../graphql";

type UseRegistrationUsersOptions = {
  limit?: number;
  pageNumber?: number;
  filters?: GuestUserFilterInput | undefined;
  sort?: GuestUserSortInput[] | undefined;
  skip?: boolean;
};

export function useRegistrationUsers(options: UseRegistrationUsersOptions = {}) {
  const { limit = 10, pageNumber = 1, filters, sort, skip } = options;

  const query = useGuestListQuery({
    pagination: { limit, page: pageNumber },
    ...(filters ? { filters } : {}),
    ...(sort ? { sort } : {}),
    skip,
  });

  return {
    users: query.users,
    totalCount: query.totalCount,
    pageCount: query.pageCount,
    loading: query.loading,
    error: query.error,
    refetch: query.refetch,
  };
}
