import { gql } from "@apollo/client";

/** Backend `UpdateEventInput` — mirrors create fields as optional patches. */
export type EventUpdateInput = {
  address?: string | null;
  brideName?: string | null;
  date?: string | null;
  endTime?: string | null;
  eventType?: string | null;
  googleMapUrl?: string | null;
  groomName?: string | null;
  hallCapacity?: number | null;
  hallRef?: string | null;
  language?: string | null;
  name?: string | null;
  numberOfGuests?: number | null;
  ownerId?: string | null;
  startTime?: string | null;
};

export type EventUpdateResult = {
  id: string;
  name: string;
};

export type EventUpdateMutationData = {
  eventUpdate: EventUpdateResult;
};

export type EventUpdateMutationVariables = {
  eventUpdateId: string;
  data: EventUpdateInput;
};

export const EVENT_UPDATE_MUTATION = gql`
  mutation EventUpdate($eventUpdateId: ID!, $data: UpdateEventInput!) {
    eventUpdate(id: $eventUpdateId, data: $data) {
      id
      name
    }
  }
`;
