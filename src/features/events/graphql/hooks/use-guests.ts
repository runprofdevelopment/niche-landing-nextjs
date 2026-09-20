"use client";

import { useMutation, useQuery } from "@apollo/client";
import { useEffect, useMemo } from "react";

import { useAppStore } from "@/features/events/store/events.store";
import {
  BulkImportGuestsDocument,
  CreateGuestDocument,
  EventGuestsDocument,
  UpdateGuestDocument,
  type CreateGuestInput,
  type UpdateGuestInput,
} from "@/lib/graphql/generated/graphql";

import { mapGenderToApi, mapGuestFromApi, mapRsvpToApi } from "../mappers/guest.mapper";

import type { GuestGender, GuestRsvpStatus } from "../../types";

export type GuestFormInput = {
  name: string;
  familyName?: string;
  email?: string;
  phone?: string;
  gender?: GuestGender;
  code?: string;
  abayaLabel?: string | null;
  rsvpStatus?: GuestRsvpStatus;
  familyId?: string;
};

export function useEventGuestsQuery(eventId: string) {
  const upsertGuests = useAppStore((state) => state.upsertGuests);
  const { data, loading, error, refetch } = useQuery(EventGuestsDocument, {
    variables: { eventId },
    skip: !eventId,
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const guests = useMemo(() => (data?.eventGuests ?? []).map(mapGuestFromApi), [data]);

  useEffect(() => {
    if (guests.length > 0) upsertGuests(guests);
  }, [guests, upsertGuests]);

  return { guests, loading, error, refetch };
}

export function useGuestMutations(eventId: string) {
  const upsertGuest = useAppStore((state) => state.upsertGuest);
  const upsertGuests = useAppStore((state) => state.upsertGuests);

  const [createGuestMutation, createState] = useMutation(CreateGuestDocument, {
    refetchQueries: ["EventGuests"],
    awaitRefetchQueries: true,
  });
  const [updateGuestMutation, updateState] = useMutation(UpdateGuestDocument, {
    refetchQueries: ["EventGuests"],
    awaitRefetchQueries: true,
  });
  const [bulkImportMutation, bulkState] = useMutation(BulkImportGuestsDocument, {
    refetchQueries: ["EventGuests"],
    awaitRefetchQueries: true,
  });

  const toCreateInput = (values: GuestFormInput): CreateGuestInput => {
    const input: CreateGuestInput = { eventId, name: values.name };
    if (values.familyName !== undefined) input.familyName = values.familyName;
    if (values.email !== undefined) input.email = values.email;
    if (values.phone !== undefined) input.phone = values.phone;
    const gender = mapGenderToApi(values.gender);
    if (gender) input.gender = gender;
    if (values.code !== undefined) input.code = values.code;
    if (values.abayaLabel) input.abayaLabel = values.abayaLabel;
    const rsvp = mapRsvpToApi(values.rsvpStatus);
    if (rsvp) input.rsvpStatus = rsvp;
    if (values.familyId !== undefined) input.groupId = values.familyId;
    return input;
  };

  return {
    createGuest: async (values: GuestFormInput) => {
      const result = await createGuestMutation({
        variables: { input: toCreateInput(values) },
      });
      const row = result.data?.createGuest;
      if (!row) throw new Error("createGuest returned no data");
      const guest = mapGuestFromApi(row);
      upsertGuest(guest);
      return guest;
    },
    updateGuest: async (id: string, values: GuestFormInput) => {
      const input: UpdateGuestInput = {};
      if (values.name !== undefined) input.name = values.name;
      if (values.familyName !== undefined) input.familyName = values.familyName;
      if (values.email !== undefined) input.email = values.email;
      if (values.phone !== undefined) input.phone = values.phone;
      const gender = mapGenderToApi(values.gender);
      if (gender) input.gender = gender;
      if (values.code !== undefined) input.code = values.code;
      if (values.abayaLabel !== undefined) input.abayaLabel = values.abayaLabel;
      const rsvp = mapRsvpToApi(values.rsvpStatus);
      if (rsvp) input.rsvpStatus = rsvp;
      if (values.familyId !== undefined) input.groupId = values.familyId;

      const result = await updateGuestMutation({ variables: { id, input } });
      const row = result.data?.updateGuest;
      if (!row) throw new Error("updateGuest returned no data");
      const guest = mapGuestFromApi(row);
      upsertGuest(guest);
      return guest;
    },
    bulkImportGuests: async (rows: GuestFormInput[]) => {
      const result = await bulkImportMutation({
        variables: {
          input: {
            eventId,
            guests: rows.map(toCreateInput),
          },
        },
      });
      const payload = result.data?.bulkImportGuests;
      if (!payload) throw new Error("bulkImportGuests returned no data");
      const guests = payload.guests.map(mapGuestFromApi);
      upsertGuests(guests);
      return {
        message: payload.message,
        importedCount: payload.importedCount,
        guests,
        errors: payload.errors.map((error) => ({
          message: error.message,
          ...(error.row != null ? { row: error.row } : {}),
          ...(error.field ? { field: error.field } : {}),
        })),
      };
    },
    creating: createState.loading,
    updating: updateState.loading,
    importing: bulkState.loading,
  };
}
