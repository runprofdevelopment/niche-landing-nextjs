"use client";

import { useQuery } from "@apollo/client";
import { useMemo } from "react";

import { mapGuestUserToListItem } from "../mappers/guest-user.mapper";
import {
  GUEST_LIST_QUERY,
  hasGuestListFilters,
  type GuestListQueryData,
  type GuestListQueryVariables,
  type GuestUserFilterInput,
  type GuestUserPaginationInput,
  type GuestUserSortInput,
} from "../queries/guest-list";

type UseGuestListQueryOptions = {
  sort?: GuestUserSortInput[] | null | undefined;
  pagination?: GuestUserPaginationInput | null | undefined;
  filters?: GuestUserFilterInput | null | undefined;
  skip?: boolean | undefined;
};

export function useGuestListQuery(options: UseGuestListQueryOptions = {}) {
  const { sort, pagination, filters, skip = false } = options;

  const variables = useMemo<GuestListQueryVariables>(() => {
    return {
      ...(sort && sort.length > 0 ? { sort } : {}),
      ...(pagination ? { pagination } : {}),
      ...(hasGuestListFilters(filters) ? { filters } : {}),
    };
  }, [filters, pagination, sort]);

  const { data, loading, error, refetch, networkStatus } = useQuery<
    GuestListQueryData,
    GuestListQueryVariables
  >(GUEST_LIST_QUERY, {
    variables,
    skip,
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const users = useMemo(() => (data?.guestList?.rows ?? []).map(mapGuestUserToListItem), [data]);

  const pageInfo = data?.guestList?.pageInfo ?? null;
  const totalCount = pageInfo?.totalCount ?? users.length;
  const pageCount = Math.max(1, pageInfo?.totalPagesCount ?? 1);

  return {
    users,
    rows: data?.guestList?.rows ?? [],
    pageInfo,
    totalCount,
    pageCount,
    loading,
    error,
    refetch,
    networkStatus,
  };
}
