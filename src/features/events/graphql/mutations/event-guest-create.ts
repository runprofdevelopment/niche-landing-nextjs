import { gql } from "@apollo/client";

export type CreateEventGuestInput = {
  countryCode: string;
  email?: string | null;
  eventId: string;
  gender: string;
  name?: string | null;
  numberOfCompanions: number;
  phoneNumber: string;
};

export type EventGuestCreateMutationData = {
  eventGuestCreate: { id: string; email: string | null } | null;
};

export const EVENT_GUEST_CREATE_MUTATION = gql`
  mutation EventGuestCreate($data: CreateEventGuestInput!) {
    eventGuestCreate(data: $data) {
      email
      id
    }
  }
`;
