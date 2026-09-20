import { gql } from "@apollo/client";

export type SaveEventSeatInput = {
  guestId: string;
  seatIndex: number;
  tableId: string;
};

export type SaveEventSeatsInput = {
  eventHallId: string;
  eventId: string;
  seats: SaveEventSeatInput[];
};

export type EventSeatSaveAllResult = {
  id: string;
  hallId: string | null;
  eventId: string | null;
};

export type EventSeatSaveAllMutationData = {
  eventSeatSaveAll: EventSeatSaveAllResult | EventSeatSaveAllResult[] | null;
};

export type EventSeatSaveAllMutationVariables = {
  data: SaveEventSeatsInput;
};

export const EVENT_SEAT_SAVE_ALL_MUTATION = gql`
  mutation EventSeatSaveAll($data: SaveEventSeatsInput!) {
    eventSeatSaveAll(data: $data) {
      id
      hallId
      eventId
    }
  }
`;
