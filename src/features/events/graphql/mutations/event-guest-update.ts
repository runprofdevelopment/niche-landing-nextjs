import { gql } from "@apollo/client";

import type { CreateEventGuestInput } from "./event-guest-create";

export type UpdateEventGuestInput = Omit<CreateEventGuestInput, "eventId">;

export type EventGuestUpdateMutationData = {
  eventGuestUpdate: { id: string; name: string | null } | null;
};

export type EventGuestUpdateMutationVariables = {
  eventGuestUpdateId: string;
  data: UpdateEventGuestInput;
};

export const EVENT_GUEST_UPDATE_MUTATION = gql`
  mutation EventGuestUpdate($eventGuestUpdateId: ID!, $data: UpdateEventGuestInput!) {
    eventGuestUpdate(id: $eventGuestUpdateId, data: $data) {
      id
      name
    }
  }
`;
