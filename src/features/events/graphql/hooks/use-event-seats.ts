"use client";

import { useMutation, useQuery } from "@apollo/client";
import { useMemo } from "react";

import {
  EVENT_SEAT_SAVE_ALL_MUTATION,
  type EventSeatSaveAllMutationData,
  type EventSeatSaveAllMutationVariables,
  type SaveEventSeatInput,
} from "../mutations/event-seat-save-all";
import {
  EVENT_SEAT_UNASSIGN_MUTATION,
  type EventSeatUnassignMutationData,
  type EventSeatUnassignMutationVariables,
} from "../mutations/event-seat-unassign";
import {
  EVENT_GUEST_SEAT_MAP_LIST_QUERY,
  type EventGuestSeatMapListQueryData,
  type EventGuestSeatMapListQueryVariables,
} from "../queries/event-guest-seat-map-list";
import {
  EVENT_TABLE_ROSTER_QUERY,
  type EventTableRosterQueryData,
  type EventTableRosterQueryVariables,
} from "../queries/event-table-roster";

const seatRefetch = ["EventHallObjectList", "EventGuestSeatMapList", "EventTableRoster"];

export function useEventGuestSeatMapListQuery(eventId: string, options: { skip?: boolean } = {}) {
  const { data, loading, error, refetch } = useQuery<
    EventGuestSeatMapListQueryData,
    EventGuestSeatMapListQueryVariables
  >(EVENT_GUEST_SEAT_MAP_LIST_QUERY, {
    variables: { eventId },
    skip: options.skip || !eventId,
    fetchPolicy: "cache-and-network",
  });

  const groups = useMemo(() => data?.eventGuestSeatMapList?.groups ?? [], [data]);
  const individuals = useMemo(() => data?.eventGuestSeatMapList?.individuals ?? [], [data]);

  return { groups, individuals, loading, error, refetch };
}

export function useEventTableRosterQuery(tableId: string | null, options: { skip?: boolean } = {}) {
  const { data, loading, error, refetch } = useQuery<
    EventTableRosterQueryData,
    EventTableRosterQueryVariables
  >(EVENT_TABLE_ROSTER_QUERY, {
    variables: { tableId: tableId ?? "" },
    skip: options.skip || !tableId,
    // Seats-only selection is safe for the cache; cache-and-network avoids empty flashes.
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });

  return {
    roster: data?.eventTableRoster ?? null,
    loading,
    error,
    refetch,
  };
}

export function useEventSeatMutations() {
  const [saveMutation, saveState] = useMutation<
    EventSeatSaveAllMutationData,
    EventSeatSaveAllMutationVariables
  >(EVENT_SEAT_SAVE_ALL_MUTATION, {
    refetchQueries: seatRefetch,
    awaitRefetchQueries: true,
  });
  const [unassignMutation, unassignState] = useMutation<
    EventSeatUnassignMutationData,
    EventSeatUnassignMutationVariables
  >(EVENT_SEAT_UNASSIGN_MUTATION, {
    refetchQueries: seatRefetch,
    awaitRefetchQueries: true,
  });

  return {
    saving: saveState.loading,
    unassigning: unassignState.loading,
    saveSeats: async (input: {
      eventId: string;
      eventHallId: string;
      seats: SaveEventSeatInput[];
    }) => {
      const result = await saveMutation({
        variables: {
          data: {
            eventId: input.eventId,
            eventHallId: input.eventHallId,
            seats: input.seats,
          },
        },
      });
      return result.data?.eventSeatSaveAll ?? null;
    },
    unassignSeat: async (input: { eventId: string; seatId: string }) => {
      const result = await unassignMutation({
        variables: { data: { eventId: input.eventId, seatId: input.seatId } },
      });
      return result.data?.eventSeatUnassign ?? null;
    },
  };
}
