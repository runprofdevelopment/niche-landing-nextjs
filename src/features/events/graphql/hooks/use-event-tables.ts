"use client";

import { useQuery } from "@apollo/client";
import { useMemo } from "react";

import { mapEventTablesListRow } from "../mappers/event-table.mapper";
import {
  EVENT_TABLES_LIST_QUERY,
  hasEventTablesListFilters,
  type EventTableFilterInput,
  type EventTablePaginationInput,
  type EventTableSortInput,
  type EventTablesListQueryData,
  type EventTablesListQueryVariables,
} from "../queries/event-tables-list";

export function useEventTablesListQuery(
  eventId: string,
  options: {
    sort?: EventTableSortInput[] | null;
    pagination?: EventTablePaginationInput | null;
    filters?: EventTableFilterInput | null;
    skip?: boolean;
  } = {},
) {
  const { sort, pagination, filters, skip = false } = options;

  const variables = useMemo<EventTablesListQueryVariables>(
    () => ({
      eventId,
      ...(sort && sort.length > 0 ? { sort } : {}),
      ...(pagination ? { pagination } : {}),
      ...(hasEventTablesListFilters(filters) ? { filters } : {}),
    }),
    [eventId, filters, pagination, sort],
  );

  const { data, loading, error, refetch } = useQuery<
    EventTablesListQueryData,
    EventTablesListQueryVariables
  >(EVENT_TABLES_LIST_QUERY, {
    variables,
    skip: skip || !eventId,
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const rows = useMemo(
    () => (data?.eventTablesList?.rows ?? []).map(mapEventTablesListRow),
    [data],
  );
  const pageInfo = data?.eventTablesList?.pageInfo ?? null;

  return {
    rows,
    pageInfo,
    totalCount: pageInfo?.totalCount ?? 0,
    pageCount: Math.max(1, pageInfo?.totalPagesCount ?? 1),
    loading,
    error,
    refetch,
  };
}
