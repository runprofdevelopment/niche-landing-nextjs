"use client";

import { useMutation, useQuery } from "@apollo/client";
import { useMemo } from "react";

import {
  buildSaveEventInvitationInput,
  mapEventInvitationFindToInvitation,
  type BuildSaveEventInvitationArgs,
} from "../mappers/invitation.mapper";
import {
  EVENT_INVITATION_SAVE_MUTATION,
  type EventInvitationSaveMutationData,
  type EventInvitationSaveMutationVariables,
} from "../mutations/event-invitation-save";
import {
  buildShareEventInvitationInput,
  EVENT_INVITATION_SHARE_MUTATION,
  type EventInvitationShareMutationData,
  type EventInvitationShareMutationVariables,
} from "../mutations/event-invitation-share";
import {
  EVENT_INVITATION_FIND_QUERY,
  type EventInvitationFindQueryData,
  type EventInvitationFindQueryVariables,
} from "../queries/event-invitation-find";

const refetchQueries = ["EventInvitationFind", "InvitationTemplateList"];

export function useEventInvitationFindQuery(eventId: string, options: { skip?: boolean } = {}) {
  const { skip = false } = options;

  const { data, loading, error, refetch } = useQuery<
    EventInvitationFindQueryData,
    EventInvitationFindQueryVariables
  >(EVENT_INVITATION_FIND_QUERY, {
    variables: { eventId },
    skip: skip || !eventId,
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const record = data?.eventInvitationFind ?? null;
  const invitation = useMemo(
    () => (record ? mapEventInvitationFindToInvitation(record, eventId) : null),
    [eventId, record],
  );

  return {
    record,
    invitation,
    html: record?.html ?? "",
    templateId: record?.templateId ?? null,
    loading,
    error,
    refetch,
  };
}

export function useEventInvitationSaveMutation() {
  const [saveMutation, saveState] = useMutation<
    EventInvitationSaveMutationData,
    EventInvitationSaveMutationVariables
  >(EVENT_INVITATION_SAVE_MUTATION, {
    refetchQueries,
    awaitRefetchQueries: true,
  });

  return {
    saveEventInvitation: async (args: BuildSaveEventInvitationArgs) => {
      const data = buildSaveEventInvitationInput(args);
      const result = await saveMutation({ variables: { data } });
      const saved = result.data?.eventInvitationSave;
      if (!saved?.id) throw new Error("eventInvitationSave returned no data");
      return saved;
    },
    saving: saveState.loading,
  };
}

export function useEventInvitationShareMutation() {
  const [shareMutation, shareState] = useMutation<
    EventInvitationShareMutationData,
    EventInvitationShareMutationVariables
  >(EVENT_INVITATION_SHARE_MUTATION);

  return {
    shareEventInvitation: async (eventId: string, guestIds?: string[] | null) => {
      const data = buildShareEventInvitationInput(eventId, guestIds);
      const result = await shareMutation({ variables: { data } });
      const shared = result.data?.eventInvitationShare;
      if (!shared?.id) throw new Error("eventInvitationShare returned no data");
      return shared;
    },
    sharing: shareState.loading,
  };
}
