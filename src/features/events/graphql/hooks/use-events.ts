"use client";

import { useMutation, useQuery } from "@apollo/client";
import { useMemo } from "react";

import { EventsDocument } from "@/lib/graphql/generated/graphql";

import {
  mapEventFindFromApi,
  mapEventFromApi,
  mapEventSetupProgressFromApi,
  mapEventStatsFromApi,
  mapStatusToApi,
} from "../mappers/event.mapper";
import {
  EVENT_CREATE_MUTATION,
  type EventCreateInput,
  type EventCreateMutationData,
} from "../mutations/event-create";
import {
  EVENT_DESTROY_MUTATION,
  type EventDestroyMutationData,
  type EventDestroyMutationVariables,
} from "../mutations/event-destroy";
import {
  EVENT_UPDATE_MUTATION,
  type EventUpdateInput,
  type EventUpdateMutationData,
} from "../mutations/event-update";
import {
  EVENT_FIND_QUERY,
  type EventFindQueryData,
  type EventFindQueryVariables,
} from "../queries/event-find";

import type { EventRecord } from "../../types";

export function useEventsQuery(status?: EventRecord["status"]) {
  const apiStatus = status ? mapStatusToApi(status) : undefined;
  const { data, loading, error, refetch } = useQuery(EventsDocument, {
    variables: apiStatus ? { status: apiStatus } : {},
    fetchPolicy: "cache-and-network",
  });

  const events = useMemo(() => (data?.events ?? []).map(mapEventFromApi), [data]);

  return { events, loading, error, refetch };
}

export function useEventQuery(eventId: string) {
  const { data, loading, error, refetch } = useQuery<EventFindQueryData, EventFindQueryVariables>(
    EVENT_FIND_QUERY,
    {
      variables: { eventId },
      skip: !eventId,
      fetchPolicy: "cache-and-network",
    },
  );

  const event = useMemo(() => {
    const row = data?.eventFind;
    return row ? mapEventFindFromApi(row) : undefined;
  }, [data]);

  const setupProgress = useMemo(
    () => mapEventSetupProgressFromApi(data?.eventSetupProgressFind),
    [data],
  );

  const stats = useMemo(() => mapEventStatsFromApi(data?.eventStatsFind), [data]);

  return { event, setupProgress, stats, loading, error, refetch };
}

export function useEventMutations() {
  const [eventCreateMutation, createState] = useMutation<EventCreateMutationData>(
    EVENT_CREATE_MUTATION,
    {
      refetchQueries: ["Events", "EventList", "EventFind"],
      awaitRefetchQueries: true,
    },
  );
  const [eventUpdateMutation, updateState] = useMutation<EventUpdateMutationData>(
    EVENT_UPDATE_MUTATION,
    {
      refetchQueries: ["Events", "EventList", "EventFind"],
      awaitRefetchQueries: true,
    },
  );
  const [eventDestroyMutation, deleteState] = useMutation<
    EventDestroyMutationData,
    EventDestroyMutationVariables
  >(EVENT_DESTROY_MUTATION, {
    refetchQueries: ["Events", "EventList"],
    awaitRefetchQueries: true,
  });

  return {
    createEvent: async (input: {
      name: string;
      brideName: string;
      groomName: string;
      date: string;
      startTime: string;
      endTime: string;
      numberOfGuests: number;
      eventType: string;
      language: string;
      ownerId: string;
      address?: string;
      googleMapUrl: string;
      hallCapacity?: number;
      hallRef?: string;
    }) => {
      const payload: EventCreateInput = {
        name: input.name,
        brideName: input.brideName,
        groomName: input.groomName,
        date: input.date,
        startTime: input.startTime,
        endTime: input.endTime,
        numberOfGuests: input.numberOfGuests,
        eventType: input.eventType,
        language: input.language,
        googleMapUrl: input.googleMapUrl,
        ownerId: input.ownerId,
      };
      if (input.address) payload.address = input.address;
      if (input.hallCapacity != null) payload.hallCapacity = input.hallCapacity;
      if (input.hallRef) payload.hallRef = input.hallRef;

      const result = await eventCreateMutation({ variables: { data: payload } });
      const row = result.data?.eventCreate;
      if (!row?.id) throw new Error("eventCreate returned no data");

      return {
        id: row.id,
        name: row.name,
        brideName: input.brideName,
        groomName: input.groomName,
        customerName: "",
        ownerId: input.ownerId,
        createdBy: "App" as const,
        date: input.date,
        startTime: input.startTime,
        endTime: input.endTime,
        venueName: input.address ?? input.hallRef ?? "",
        expectedGuests: input.numberOfGuests,
        invitationCount: 0,
        status: "upcoming" as const,
        eventType: input.eventType,
        language: input.language,
        createdAt: new Date().toISOString(),
        ...(input.hallCapacity != null ? { hallCapacity: input.hallCapacity } : {}),
        ...(input.hallRef ? { hallReference: input.hallRef } : {}),
        ...(input.address ? { address: input.address } : {}),
        googleMapsUrl: input.googleMapUrl,
      } satisfies EventRecord;
    },
    updateEvent: async (id: string, input: EventUpdateInput) => {
      const result = await eventUpdateMutation({
        variables: { eventUpdateId: id, data: input },
      });
      const row = result.data?.eventUpdate;
      if (!row?.id) throw new Error("eventUpdate returned no data");
      return row;
    },
    deleteEvent: async (id: string) => {
      const result = await eventDestroyMutation({ variables: { eventDestroyId: id } });
      const row = result.data?.eventDestroy;
      if (!row?.id) throw new Error("eventDestroy returned no data");
      return row;
    },
    creating: createState.loading,
    updating: updateState.loading,
    deleting: deleteState.loading,
  };
}
