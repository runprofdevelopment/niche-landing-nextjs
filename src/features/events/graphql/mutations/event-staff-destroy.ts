import { gql } from "@apollo/client";

export type EventStaffDestroyMutationData = {
  eventStaffDestroy: { id: string } | null;
};

export type EventStaffDestroyMutationVariables = {
  eventStaffDestroyId: string;
};

export const EVENT_STAFF_DESTROY_MUTATION = gql`
  mutation EventStaffDestroy($eventStaffDestroyId: ID!) {
    eventStaffDestroy(id: $eventStaffDestroyId) {
      id
    }
  }
`;
