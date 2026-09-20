import { gql } from "@apollo/client";

export type EventCreateInput = {
  address?: string | null;
  brideName: string;
  date: string;
  endTime: string;
  eventType: string;
  googleMapUrl: string;
  groomName: string;
  hallCapacity?: number | null;
  hallRef?: string | null;
  language: string;
  name: string;
  numberOfGuests: number;
  ownerId: string;
  startTime: string;
};

export type EventCreateResult = {
  id: string;
  name: string;
};

export type EventCreateMutationData = {
  eventCreate: EventCreateResult;
};

export const EVENT_CREATE_MUTATION = gql`
  mutation EventCreate($data: CreateEventInput!) {
    eventCreate(data: $data) {
      id
      name
    }
  }
`;
