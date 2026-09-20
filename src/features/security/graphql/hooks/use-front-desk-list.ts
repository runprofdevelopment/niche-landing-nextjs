"use client";

import { useQuery } from "@apollo/client";
import { useMemo } from "react";

import { mapFrontDeskListRow } from "../mappers/member.mapper";
import {
  FRONT_DESK_LIST_QUERY,
  hasFrontDeskListFilters,
  type FrontDeskFilterInput,
  type FrontDeskListQueryData,
  type FrontDeskListQueryVariables,
  type FrontDeskPaginationInput,
  type FrontDeskSortInput,
} from "../queries/front-desk-list";

type UseFrontDeskListQueryOptions = {
  sort?: FrontDeskSortInput[] | null | undefined;
  pagination?: FrontDeskPaginationInput | null | undefined;
  filters?: FrontDeskFilterInput | null | undefined;
  skip?: boolean | undefined;
};

export function useFrontDeskListQuery(options: UseFrontDeskListQueryOptions = {}) {
  const { sort, pagination, filters, skip = false } = options;

  const variables = useMemo<FrontDeskListQueryVariables>(
    () => ({
      ...(sort && sort.length > 0 ? { sort } : {}),
      ...(pagination ? { pagination } : {}),
      ...(hasFrontDeskListFilters(filters) ? { filters } : {}),
    }),
    [filters, pagination, sort],
  );

  const { data, loading, error, refetch, networkStatus } = useQuery<
    FrontDeskListQueryData,
    FrontDeskListQueryVariables
  >(FRONT_DESK_LIST_QUERY, {
    variables,
    skip,
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const members = useMemo(() => (data?.frontDeskList?.rows ?? []).map(mapFrontDeskListRow), [data]);

  const pageInfo = data?.frontDeskList?.pageInfo ?? null;
  const totalCount = pageInfo?.totalCount ?? 0;
  const pageCount = Math.max(1, pageInfo?.totalPagesCount ?? 1);

  return {
    members,
    pageInfo,
    totalCount,
    pageCount,
    loading,
    error,
    refetch,
    networkStatus,
  };
}
