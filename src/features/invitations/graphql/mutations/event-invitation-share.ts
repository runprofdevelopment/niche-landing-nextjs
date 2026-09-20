import { gql } from "@apollo/client";

export type ShareEventInvitationInput = {
  eventId: string;
  /** Omit to share with all guests; pass one or more ids to target specific guests. */
  guestIds?: string[] | null;
};

export type EventInvitationShareResult = {
  id: string;
};

export type EventInvitationShareMutationData = {
  eventInvitationShare: EventInvitationShareResult | null;
};

export type EventInvitationShareMutationVariables = {
  data: ShareEventInvitationInput;
};

export function buildShareEventInvitationInput(
  eventId: string,
  guestIds?: string[] | null,
): ShareEventInvitationInput {
  const trimmed = guestIds?.map((id) => id.trim()).filter(Boolean) ?? [];
  if (trimmed.length > 0) {
    return { eventId, guestIds: trimmed };
  }
  return { eventId };
}

export const EVENT_INVITATION_SHARE_MUTATION = gql`
  mutation EventInvitationShare($data: ShareEventInvitationInput!) {
    eventInvitationShare(data: $data) {
      id
    }
  }
`;
