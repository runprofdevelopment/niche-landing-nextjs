import { gql } from "@apollo/client";

export type EventSeatUnassignInput = {
  eventId: string;
  seatId: string;
};

export type EventSeatUnassignMutationData = {
  eventSeatUnassign: { id: string } | null;
};

export type EventSeatUnassignMutationVariables = {
  data: EventSeatUnassignInput;
};

export const EVENT_SEAT_UNASSIGN_MUTATION = gql`
  mutation EventSeatUnassign($data: EventSeatUnassignInput!) {
    eventSeatUnassign(data: $data) {
      id
    }
  }
`;
