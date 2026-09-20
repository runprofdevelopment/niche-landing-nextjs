"use client";

import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { useMemo } from "react";

import { toApiDialCode } from "@/shared/utils/international-phone";

import { mapEventGuestListRow } from "../mappers/guest.mapper";
import {
  EVENT_GUEST_CHECK_IN_MUTATION,
  type EventGuestCheckInMutationData,
  type EventGuestCheckInMutationVariables,
} from "../mutations/event-guest-check-in";
import {
  EVENT_GUEST_CREATE_MUTATION,
  type CreateEventGuestInput,
  type EventGuestCreateMutationData,
} from "../mutations/event-guest-create";
import {
  EVENT_GUEST_DESTROY_MUTATION,
  type EventGuestDestroyMutationData,
  type EventGuestDestroyMutationVariables,
} from "../mutations/event-guest-destroy";
import {
  EVENT_GUEST_UPDATE_MUTATION,
  type EventGuestUpdateMutationData,
  type EventGuestUpdateMutationVariables,
  type UpdateEventGuestInput,
} from "../mutations/event-guest-update";
import {
  EVENT_GUEST_FIND_BY_CODE_QUERY,
  type EventGuestFindByCodeQueryData,
  type EventGuestFindByCodeQueryVariables,
} from "../queries/event-guest-find-by-code";
import {
  EVENT_GUEST_LIST_QUERY,
  hasEventGuestListFilters,
  type EventGuestFilterInput,
  type EventGuestListQueryData,
  type EventGuestListQueryVariables,
  type EventGuestPaginationInput,
  type EventGuestSortInput,
} from "../queries/event-guest-list";

import type { GuestDetailsFormValues } from "../../schemas/event-forms.schema";

const refetchQueries = ["EventGuestList", "EventFind"];

export function useEventGuestFindByCodeLazyQuery() {
  const [runQuery, state] = useLazyQuery<
    EventGuestFindByCodeQueryData,
    EventGuestFindByCodeQueryVariables
  >(EVENT_GUEST_FIND_BY_CODE_QUERY, {
    fetchPolicy: "network-only",
  });

  return {
    findGuestByCode: async (eventId: string, code: string) => {
      const result = await runQuery({ variables: { eventId, code } });
      return result.data?.eventGuestFindByCode ?? null;
    },
    loading: state.loading,
    error: state.error,
  };
}

export function useEventGuestListQuery(
  eventId: string,
  options: {
    sort?: EventGuestSortInput[] | null;
    pagination?: EventGuestPaginationInput | null;
    filters?: EventGuestFilterInput | null;
    skip?: boolean;
  } = {},
) {
  const { sort, pagination, filters, skip = false } = options;
  const variables = useMemo<EventGuestListQueryVariables>(
    () => ({
      eventId,
      ...(sort && sort.length > 0 ? { sort } : {}),
      ...(pagination ? { pagination } : {}),
      ...(hasEventGuestListFilters(filters) ? { filters } : {}),
    }),
    [eventId, filters, pagination, sort],
  );

  const { data, loading, error, refetch } = useQuery<
    EventGuestListQueryData,
    EventGuestListQueryVariables
  >(EVENT_GUEST_LIST_QUERY, {
    variables,
    skip: skip || !eventId,
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const guests = useMemo(
    () => (data?.eventGuestList?.rows ?? []).map(mapEventGuestListRow),
    [data],
  );
  const pageInfo = data?.eventGuestList?.pageInfo ?? null;

  return {
    guests,
    pageInfo,
    totalCount: pageInfo?.totalCount ?? 0,
    pageCount: Math.max(1, pageInfo?.totalPagesCount ?? 1),
    loading,
    error,
    refetch,
  };
}

function toGuestInput(values: GuestDetailsFormValues): UpdateEventGuestInput {
  const phoneNumber = values.phone.replace(/\D/g, "");
  const input: UpdateEventGuestInput = {
    countryCode: toApiDialCode(values.countryCode),
    gender: values.gender,
    numberOfCompanions: values.companions ?? 0,
    phoneNumber,
  };
  const name = values.name.trim();
  const email = values.email.trim();
  input.name = name;
  input.email = email || null;
  return input;
}

export function useEventGuestMutations(eventId: string) {
  const [createMutation, createState] = useMutation<EventGuestCreateMutationData>(
    EVENT_GUEST_CREATE_MUTATION,
    { refetchQueries, awaitRefetchQueries: true },
  );
  const [updateMutation, updateState] = useMutation<
    EventGuestUpdateMutationData,
    EventGuestUpdateMutationVariables
  >(EVENT_GUEST_UPDATE_MUTATION, { refetchQueries, awaitRefetchQueries: true });
  const [destroyMutation, destroyState] = useMutation<
    EventGuestDestroyMutationData,
    EventGuestDestroyMutationVariables
  >(EVENT_GUEST_DESTROY_MUTATION, { refetchQueries, awaitRefetchQueries: true });
  const [checkInMutation, checkInState] = useMutation<
    EventGuestCheckInMutationData,
    EventGuestCheckInMutationVariables
  >(EVENT_GUEST_CHECK_IN_MUTATION, { refetchQueries, awaitRefetchQueries: true });

  return {
    creating: createState.loading,
    updating: updateState.loading,
    destroying: destroyState.loading,
    checkingIn: checkInState.loading,
    createGuest: async (values: GuestDetailsFormValues) => {
      const data: CreateEventGuestInput = { ...toGuestInput(values), eventId };
      const result = await createMutation({ variables: { data } });
      return result.data?.eventGuestCreate ?? null;
    },
    updateGuest: async (id: string, values: GuestDetailsFormValues) => {
      const result = await updateMutation({
        variables: { eventGuestUpdateId: id, data: toGuestInput(values) },
      });
      return result.data?.eventGuestUpdate ?? null;
    },
    destroyGuest: async (id: string) => {
      const result = await destroyMutation({ variables: { eventGuestDestroyId: id } });
      return result.data?.eventGuestDestroy ?? null;
    },
    checkInGuest: async (code: string) => {
      const result = await checkInMutation({
        variables: { eventId, code },
      });
      const guest = result.data?.eventGuestCheckIn?.guest;
      if (!guest?.id) throw new Error("eventGuestCheckIn returned no guest");
      return guest;
    },
  };
}
