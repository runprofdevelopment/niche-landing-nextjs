import { gql } from "@apollo/client";

import type { EventStaffRole } from "../queries/event-staff-list";

export type CreateEventStaffInput = {
  eventId: string;
  note?: string | null;
  role: EventStaffRole;
  /** Staff or front-desk member id. */
  userId: string;
};

export type EventStaffCreateMutationData = {
  eventStaffCreate: { id: string } | null;
};

export type EventStaffCreateMutationVariables = {
  data: CreateEventStaffInput;
};

export const EVENT_STAFF_CREATE_MUTATION = gql`
  mutation EventStaffCreate($data: CreateEventStaffInput!) {
    eventStaffCreate(data: $data) {
      id
    }
  }
`;
