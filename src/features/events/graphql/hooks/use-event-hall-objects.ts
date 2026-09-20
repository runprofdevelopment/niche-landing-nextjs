"use client";

import { useMutation, useQuery } from "@apollo/client";
import { useMemo } from "react";

import { mapHallObjectFromApi, mapHallObjectToSaveInput } from "../mappers/hall-object.mapper";
import {
  EVENT_HALL_OBJECT_DESTROY_MUTATION,
  type EventHallObjectDestroyMutationData,
  type EventHallObjectDestroyMutationVariables,
} from "../mutations/event-hall-object-destroy";
import {
  EVENT_HALL_OBJECT_SAVE_ALL_MUTATION,
  type EventHallObjectSaveAllMutationData,
  type SaveEventHallObjectsInput,
} from "../mutations/event-hall-object-save-all";
import {
  EVENT_HALL_OBJECT_LIST_QUERY,
  type EventHallObjectListQueryData,
  type EventHallObjectListQueryVariables,
} from "../queries/event-hall-object-list";

import type { HallObject } from "../../types";

const refetchQueries = ["EventHallObjectList", "EventHallFind", "EventHallList"];

export function useEventHallObjectListQuery(eventId: string, eventHallId: string) {
  const { data, loading, error, refetch } = useQuery<
    EventHallObjectListQueryData,
    EventHallObjectListQueryVariables
  >(EVENT_HALL_OBJECT_LIST_QUERY, {
    variables: { eventId, eventHallId },
    skip: !eventId || !eventHallId,
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const objects = useMemo(
    () => (data?.eventHallObjectList ?? []).map(mapHallObjectFromApi),
    [data],
  );
  const persistedIds = useMemo(() => new Set(objects.map((object) => object.id)), [objects]);
  const ready = data !== undefined || Boolean(error);

  return { objects, persistedIds, loading, error, refetch, ready };
}

export function useEventHallObjectMutations() {
  const [saveMutation, saveState] = useMutation<EventHallObjectSaveAllMutationData>(
    EVENT_HALL_OBJECT_SAVE_ALL_MUTATION,
    { refetchQueries, awaitRefetchQueries: true },
  );
  const [destroyMutation, destroyState] = useMutation<
    EventHallObjectDestroyMutationData,
    EventHallObjectDestroyMutationVariables
  >(EVENT_HALL_OBJECT_DESTROY_MUTATION, { refetchQueries, awaitRefetchQueries: true });

  return {
    saving: saveState.loading,
    destroying: destroyState.loading,
    saveAllObjects: async (input: {
      eventId: string;
      eventHallId: string;
      objects: HallObject[];
      /** IDs loaded from `EventHallObjectList` — included on edit; omitted for new objects. */
      persistedIds?: ReadonlySet<string>;
    }) => {
      const persistedIds = input.persistedIds;
      const data: SaveEventHallObjectsInput = {
        eventId: input.eventId,
        eventHallId: input.eventHallId,
        objects: input.objects.map((object) =>
          mapHallObjectToSaveInput(object, {
            includeId: Boolean(persistedIds?.has(object.id)),
          }),
        ),
      };
      const result = await saveMutation({ variables: { data } });
      const payload = result.data?.eventHallObjectSaveAll;
      if (!payload) return [];
      return Array.isArray(payload) ? payload : [payload];
    },
    destroyObject: async (id: string) => {
      const result = await destroyMutation({ variables: { eventHallObjectDestroyId: id } });
      return result.data?.eventHallObjectDestroy ?? null;
    },
  };
}
