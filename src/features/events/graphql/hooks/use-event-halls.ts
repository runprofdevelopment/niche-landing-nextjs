"use client";

import { useMutation, useQuery } from "@apollo/client";
import { useMemo } from "react";

import { COORDINATE_SYSTEM } from "../../domain/coordinate-system";
import { useAppStore } from "../../store/events.store";
import {
  mapBoundaryToApi,
  mapEventHallFromApi,
  mapTableTemplateToApi,
} from "../mappers/hall.mapper";
import {
  EVENT_HALL_CREATE_MUTATION,
  type EventHallCreateInput,
  type EventHallCreateMutationData,
} from "../mutations/event-hall-create";
import {
  EVENT_HALL_UPDATE_MUTATION,
  type EventHallUpdateInput,
  type EventHallUpdateMutationData,
} from "../mutations/event-hall-update";
import {
  EVENT_HALL_FIND_QUERY,
  type EventHallFindQueryData,
  type EventHallFindQueryVariables,
} from "../queries/event-hall-find";
import {
  EVENT_HALL_LIST_QUERY,
  type EventHallListQueryData,
  type EventHallListQueryVariables,
} from "../queries/event-hall-list";

import type { Hall, HallBoundary, TableTemplate } from "../../types";

export function useEventHallListQuery(eventId: string) {
  const { data, loading, error, refetch } = useQuery<
    EventHallListQueryData,
    EventHallListQueryVariables
  >(EVENT_HALL_LIST_QUERY, {
    variables: { eventId },
    skip: !eventId,
    fetchPolicy: "cache-and-network",
  });

  const halls = useMemo(
    () => (data?.eventHallList ?? []).map((row) => mapEventHallFromApi(row)),
    [data],
  );

  return { halls, loading, error, refetch };
}

export function useEventHallFindQuery(
  hallId: string,
  options?: { expectedGuests?: number; eventType?: string },
) {
  const expectedGuests = options?.expectedGuests;
  const eventType = options?.eventType;
  const existingObjects = useAppStore((state) => state.getHall(hallId)?.layout.objects);

  const { data, loading, error, refetch } = useQuery<
    EventHallFindQueryData,
    EventHallFindQueryVariables
  >(EVENT_HALL_FIND_QUERY, {
    variables: { eventHallFindId: hallId },
    skip: !hallId,
    fetchPolicy: "cache-and-network",
  });

  const hall = useMemo(() => {
    const row = data?.eventHallFind;
    if (!row) return undefined;
    return mapEventHallFromApi(row, {
      ...(expectedGuests != null ? { expectedGuests } : {}),
      ...(eventType ? { eventType } : {}),
      ...(existingObjects?.length ? { existingObjects } : {}),
    });
  }, [data, existingObjects, expectedGuests, eventType]);

  return { hall, loading, error, refetch };
}

export function useEventHallMutations() {
  const upsertHall = useAppStore((state) => state.upsertHall);
  const updateHallLocal = useAppStore((state) => state.updateHall);

  const [createMutation, createState] = useMutation<EventHallCreateMutationData>(
    EVENT_HALL_CREATE_MUTATION,
    {
      refetchQueries: ["EventHallList", "EventFind"],
      awaitRefetchQueries: true,
    },
  );

  const [updateMutation, updateState] = useMutation<EventHallUpdateMutationData>(
    EVENT_HALL_UPDATE_MUTATION,
    {
      refetchQueries: ["EventHallList", "EventHallFind"],
      awaitRefetchQueries: true,
    },
  );

  return {
    createHall: async (input: {
      eventId: string;
      name: string;
      boundary: HallBoundary;
      tableTemplates: TableTemplate[];
    }) => {
      const payload: EventHallCreateInput = {
        eventId: input.eventId,
        name: input.name,
        coordinateSystem: { ...COORDINATE_SYSTEM },
        boundary: mapBoundaryToApi(input.boundary),
        tableTemplates: input.tableTemplates.map(mapTableTemplateToApi),
      };

      const result = await createMutation({ variables: { data: payload } });
      const row = result.data?.eventHallCreate;
      if (!row?.id) throw new Error("eventHallCreate returned no data");

      const hall: Hall = {
        id: row.id,
        eventId: row.eventId || input.eventId,
        name: row.name || input.name,
        hallType: "wedding",
        expectedGuests: 0,
        boundary: input.boundary,
        tableTemplates: input.tableTemplates,
        layout: {
          hallId: row.id,
          coordinateSystem: { ...COORDINATE_SYSTEM },
          objects: [],
        },
      };

      upsertHall(hall);
      return hall;
    },
    updateHall: async (
      hallId: string,
      input: {
        name?: string;
        boundary?: HallBoundary;
        tableTemplates?: TableTemplate[];
      },
    ) => {
      const data: EventHallUpdateInput = {};
      if (input.name != null) data.name = input.name;
      if (input.boundary) data.boundary = mapBoundaryToApi(input.boundary);
      if (input.tableTemplates) {
        data.tableTemplates = input.tableTemplates.map(mapTableTemplateToApi);
      }

      const result = await updateMutation({
        variables: { eventHallUpdateId: hallId, data },
      });
      const row = result.data?.eventHallUpdate;
      if (!row?.id) throw new Error("eventHallUpdate returned no data");

      updateHallLocal(hallId, {
        ...(input.name != null ? { name: input.name } : {}),
        ...(input.boundary ? { boundary: input.boundary } : {}),
        ...(input.tableTemplates ? { tableTemplates: input.tableTemplates } : {}),
      });

      return row;
    },
    creating: createState.loading,
    updating: updateState.loading,
  };
}
