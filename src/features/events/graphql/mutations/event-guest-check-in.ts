import { gql } from "@apollo/client";

export type EventGuestCheckInMutationData = {
  eventGuestCheckIn: {
    guest: {
      id: string;
      name: string | null;
    } | null;
  } | null;
};

export type EventGuestCheckInMutationVariables = {
  eventId: string;
  code: string;
};

export const EVENT_GUEST_CHECK_IN_MUTATION = gql`
  mutation EventGuestCheckIn($eventId: ID!, $code: String!) {
    eventGuestCheckIn(eventId: $eventId, code: $code) {
      guest {
        id
        name
      }
    }
  }
`;
