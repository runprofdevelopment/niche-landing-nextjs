"use client";

import { useMutation, useQuery } from "@apollo/client";
import { useMemo } from "react";

import { mapEventStaffListRow } from "../mappers/event-staff.mapper";
import {
  EVENT_STAFF_CREATE_MUTATION,
  type CreateEventStaffInput,
  type EventStaffCreateMutationData,
  type EventStaffCreateMutationVariables,
} from "../mutations/event-staff-create";
import {
  EVENT_STAFF_DESTROY_MUTATION,
  type EventStaffDestroyMutationData,
  type EventStaffDestroyMutationVariables,
} from "../mutations/event-staff-destroy";
import {
  EVENT_STAFF_LIST_QUERY,
  hasEventStaffListFilters,
  type EventStaffFilterInput,
  type EventStaffListQueryData,
  type EventStaffListQueryVariables,
  type EventStaffPaginationInput,
  type EventStaffSortInput,
} from "../queries/event-staff-list";

const refetchQueries = ["EventStaffList", "EventFind"];

export function useEventStaffListQuery(
  eventId: string,
  options: {
    sort?: EventStaffSortInput[] | null;
    pagination?: EventStaffPaginationInput | null;
    filters?: EventStaffFilterInput | null;
    skip?: boolean;
  } = {},
) {
  const { sort, pagination, filters, skip = false } = options;

  const variables = useMemo<EventStaffListQueryVariables>(
    () => ({
      eventId,
      ...(sort && sort.length > 0 ? { sort } : {}),
      ...(pagination ? { pagination } : {}),
      ...(hasEventStaffListFilters(filters) ? { filters } : {}),
    }),
    [eventId, filters, pagination, sort],
  );

  const { data, loading, error, refetch } = useQuery<
    EventStaffListQueryData,
    EventStaffListQueryVariables
  >(EVENT_STAFF_LIST_QUERY, {
    variables,
    skip: skip || !eventId,
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const rows = useMemo(() => (data?.eventStaffList?.rows ?? []).map(mapEventStaffListRow), [data]);
  const pageInfo = data?.eventStaffList?.pageInfo ?? null;

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

export function useEventStaffMutations(eventId: string) {
  const [createMutation, createState] = useMutation<
    EventStaffCreateMutationData,
    EventStaffCreateMutationVariables
  >(EVENT_STAFF_CREATE_MUTATION, {
    refetchQueries,
    awaitRefetchQueries: true,
  });

  const [destroyMutation, destroyState] = useMutation<
    EventStaffDestroyMutationData,
    EventStaffDestroyMutationVariables
  >(EVENT_STAFF_DESTROY_MUTATION, {
    refetchQueries,
    awaitRefetchQueries: true,
  });

  return {
    createEventStaff: async (
      input: Omit<CreateEventStaffInput, "eventId"> & { eventId?: string },
    ) => {
      const payload: CreateEventStaffInput = {
        eventId: input.eventId ?? eventId,
        note: input.note?.trim() ? input.note.trim() : null,
        role: input.role,
        userId: input.userId,
      };
      const result = await createMutation({ variables: { data: payload } });
      const row = result.data?.eventStaffCreate;
      if (!row?.id) throw new Error("eventStaffCreate returned no data");
      return row;
    },
    destroyEventStaff: async (id: string) => {
      const result = await destroyMutation({
        variables: { eventStaffDestroyId: id },
      });
      const row = result.data?.eventStaffDestroy;
      if (!row?.id) throw new Error("eventStaffDestroy returned no data");
      return row;
    },
    creating: createState.loading,
    destroying: destroyState.loading,
  };
}
