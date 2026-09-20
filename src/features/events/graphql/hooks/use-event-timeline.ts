"use client";

import { useMutation, useQuery } from "@apollo/client";
import { useMemo } from "react";

import { mapTimelineSlotFromApi } from "../mappers/timeline.mapper";
import {
  EVENT_TIMELINE_CREATE_MUTATION,
  type CreateEventTimelineInput,
  type EventTimelineCreateMutationData,
  type EventTimelineCreateMutationVariables,
} from "../mutations/event-timeline-create";
import {
  EVENT_TIMELINE_DESTROY_MUTATION,
  type EventTimelineDestroyMutationData,
  type EventTimelineDestroyMutationVariables,
} from "../mutations/event-timeline-destroy";
import {
  EVENT_TIMELINE_UPDATE_MUTATION,
  type EventTimelineUpdateMutationData,
  type EventTimelineUpdateMutationVariables,
  type UpdateEventTimelineInput,
} from "../mutations/event-timeline-update";
import {
  EVENT_TIMELINE_FIND_QUERY,
  type EventTimelineFindQueryData,
  type EventTimelineFindQueryVariables,
} from "../queries/event-timeline-find";
import {
  EVENT_TIMELINE_LIST_QUERY,
  type EventTimelineListQueryData,
  type EventTimelineListQueryVariables,
} from "../queries/event-timeline-list";

import type { TimelineSlotFormValues } from "../../schemas/event-forms.schema";

const refetchQueries = ["EventTimelineList"];

export function useEventTimelineListQuery(
  eventId: string,
  options: { eventDate?: string; skip?: boolean } = {},
) {
  const { eventDate, skip = false } = options;

  const { data, loading, error, refetch } = useQuery<
    EventTimelineListQueryData,
    EventTimelineListQueryVariables
  >(EVENT_TIMELINE_LIST_QUERY, {
    variables: { eventId },
    skip: skip || !eventId,
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const slots = useMemo(
    () =>
      (data?.eventTimelineList ?? []).map((node) =>
        mapTimelineSlotFromApi(node, eventDate ? { eventDate } : {}),
      ),
    [data, eventDate],
  );

  return { slots, loading, error, refetch };
}

export function useEventTimelineFindQuery(
  id: string,
  options: { eventDate?: string; skip?: boolean } = {},
) {
  const { eventDate, skip = false } = options;

  const { data, loading, error, refetch } = useQuery<
    EventTimelineFindQueryData,
    EventTimelineFindQueryVariables
  >(EVENT_TIMELINE_FIND_QUERY, {
    variables: { eventTimelineFindId: id },
    skip: skip || !id,
    fetchPolicy: "cache-and-network",
  });

  const slot = useMemo(() => {
    const node = data?.eventTimelineFind;
    if (!node) return null;
    return mapTimelineSlotFromApi(node, eventDate ? { eventDate } : {});
  }, [data, eventDate]);

  return { slot, loading, error, refetch };
}

function toTimelineInput(
  values: TimelineSlotFormValues,
): Omit<CreateEventTimelineInput, "eventId"> {
  const description = values.description.trim();
  return {
    title: values.title.trim(),
    startTime: values.start,
    endTime: values.end,
    description: description || null,
  };
}

export function useEventTimelineMutations(eventId: string) {
  const [createMutation, createState] = useMutation<
    EventTimelineCreateMutationData,
    EventTimelineCreateMutationVariables
  >(EVENT_TIMELINE_CREATE_MUTATION, { refetchQueries, awaitRefetchQueries: true });

  const [updateMutation, updateState] = useMutation<
    EventTimelineUpdateMutationData,
    EventTimelineUpdateMutationVariables
  >(EVENT_TIMELINE_UPDATE_MUTATION, { refetchQueries, awaitRefetchQueries: true });

  const [destroyMutation, destroyState] = useMutation<
    EventTimelineDestroyMutationData,
    EventTimelineDestroyMutationVariables
  >(EVENT_TIMELINE_DESTROY_MUTATION, { refetchQueries, awaitRefetchQueries: true });

  return {
    creating: createState.loading,
    updating: updateState.loading,
    destroying: destroyState.loading,
    createTimelineSlot: async (values: TimelineSlotFormValues) => {
      const data: CreateEventTimelineInput = { ...toTimelineInput(values), eventId };
      const result = await createMutation({ variables: { data } });
      return result.data?.eventTimelineCreate ?? null;
    },
    updateTimelineSlot: async (id: string, values: TimelineSlotFormValues) => {
      const data: UpdateEventTimelineInput = toTimelineInput(values);
      const result = await updateMutation({
        variables: { eventTimelineUpdateId: id, data },
      });
      return result.data?.eventTimelineUpdate ?? null;
    },
    destroyTimelineSlot: async (id: string) => {
      const result = await destroyMutation({
        variables: { eventTimelineDestroyId: id },
      });
      return result.data?.eventTimelineDestroy ?? null;
    },
  };
}
