"use client";

import { useQuery } from "@apollo/client";
import { useMemo } from "react";

import { mapEventListRowFromApi } from "../mappers/event.mapper";
import {
  EVENT_LIST_QUERY,
  hasEventListFilters,
  type EventFilterInput,
  type EventListQueryData,
  type EventListQueryVariables,
  type EventPaginationInput,
  type EventSortInput,
} from "../queries/event-list";

type UseEventListQueryOptions = {
  sort?: EventSortInput[] | null | undefined;
  pagination?: EventPaginationInput | null | undefined;
  filters?: EventFilterInput | null | undefined;
  skip?: boolean | undefined;
};

export function useEventListQuery(options: UseEventListQueryOptions = {}) {
  const { sort, pagination, filters, skip = false } = options;

  const variables = useMemo<EventListQueryVariables>(
    () => ({
      ...(sort && sort.length > 0 ? { sort } : {}),
      ...(pagination ? { pagination } : {}),
      ...(hasEventListFilters(filters) ? { filters } : {}),
    }),
    [filters, pagination, sort],
  );

  const { data, loading, error, refetch, networkStatus } = useQuery<
    EventListQueryData,
    EventListQueryVariables
  >(EVENT_LIST_QUERY, {
    variables,
    skip,
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const events = useMemo(() => (data?.eventList?.rows ?? []).map(mapEventListRowFromApi), [data]);

  const pageInfo = data?.eventList?.pageInfo ?? null;
  const totalCount = pageInfo?.totalCount ?? 0;
  const pageCount = Math.max(1, pageInfo?.totalPagesCount ?? 1);

  return {
    events,
    pageInfo,
    totalCount,
    pageCount,
    loading,
    error,
    refetch,
    networkStatus,
  };
}
