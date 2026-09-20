import { gql } from "@apollo/client";

export type EventGuestDestroyMutationData = {
  eventGuestDestroy: { id: string; email: string | null } | null;
};

export type EventGuestDestroyMutationVariables = {
  eventGuestDestroyId: string;
};

export const EVENT_GUEST_DESTROY_MUTATION = gql`
  mutation EventGuestDestroy($eventGuestDestroyId: ID!) {
    eventGuestDestroy(id: $eventGuestDestroyId) {
      email
      id
    }
  }
`;
