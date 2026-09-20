"use client";

import { useQuery } from "@apollo/client";
import { useMemo } from "react";

import {
  EVENT_TYPE_ENUM_QUERY,
  type EventTypeEnumItem,
  type EventTypeEnumQueryData,
} from "../queries/event-type-enum";

export function useEventTypeEnumQuery() {
  const { data, loading, error, refetch } = useQuery<EventTypeEnumQueryData>(EVENT_TYPE_ENUM_QUERY, {
    fetchPolicy: "cache-first",
  });

  const options = useMemo(
    () =>
      (data?.eventTypeEnum ?? []).map((item: EventTypeEnumItem) => ({
        value: item.id,
        label: item.label,
      })),
    [data?.eventTypeEnum],
  );

  return { options, loading, error, refetch };
}
