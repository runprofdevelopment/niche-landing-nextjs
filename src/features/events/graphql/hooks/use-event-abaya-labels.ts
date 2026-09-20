"use client";

import { useMutation, useQuery } from "@apollo/client";
import { useMemo } from "react";

import { mapAbayaLabelSetFromApi } from "../mappers/abaya-label.mapper";
import {
  EVENT_ABAYA_LABEL_GENERATE_MUTATION,
  type EventAbayaLabelGenerateMutationData,
  type EventAbayaLabelGenerateMutationVariables,
  type GenerateEventAbayaLabelInput,
} from "../mutations/event-abaya-label-generate";
import {
  EVENT_ABAYA_LABEL_SET_FIND_QUERY,
  type EventAbayaLabelSetFindQueryData,
  type EventAbayaLabelSetFindQueryVariables,
} from "../queries/event-abaya-label-set-find";

const refetchQueries = ["EventAbayaLabelSetFind", "EventFind"];

export function useEventAbayaLabelSetFindQuery(eventId: string, options: { skip?: boolean } = {}) {
  const { skip = false } = options;

  const { data, loading, error, refetch } = useQuery<
    EventAbayaLabelSetFindQueryData,
    EventAbayaLabelSetFindQueryVariables
  >(EVENT_ABAYA_LABEL_SET_FIND_QUERY, {
    variables: { eventId },
    skip: skip || !eventId,
    fetchPolicy: "cache-and-network",
  });

  const batch = useMemo(() => {
    const node = data?.eventAbayaLabelSetFind;
    return node ? mapAbayaLabelSetFromApi(node) : undefined;
  }, [data]);

  return { batch, loading, error, refetch };
}

export function useEventAbayaLabelMutations() {
  const [generateMutation, generateState] = useMutation<
    EventAbayaLabelGenerateMutationData,
    EventAbayaLabelGenerateMutationVariables
  >(EVENT_ABAYA_LABEL_GENERATE_MUTATION, {
    refetchQueries,
    awaitRefetchQueries: true,
  });

  return {
    generateAbayaLabels: async (input: GenerateEventAbayaLabelInput) => {
      const suffix = input.suffix?.trim();
      const result = await generateMutation({
        variables: {
          data: {
            eventId: input.eventId,
            prefix: input.prefix.trim(),
            from: input.from,
            to: input.to,
            suffix: suffix ? suffix : null,
          },
        },
      });
      const row = result.data?.eventAbayaLabelGenerate;
      if (!row?.id) throw new Error("eventAbayaLabelGenerate returned no data");
      return row;
    },
    generating: generateState.loading,
  };
}
