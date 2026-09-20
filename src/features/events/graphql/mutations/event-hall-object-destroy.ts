import { gql } from "@apollo/client";

export type EventHallObjectDestroyResult = {
  id: string;
  label: string | null;
};

export type EventHallObjectDestroyMutationData = {
  eventHallObjectDestroy: EventHallObjectDestroyResult;
};

export type EventHallObjectDestroyMutationVariables = {
  eventHallObjectDestroyId: string;
};

export const EVENT_HALL_OBJECT_DESTROY_MUTATION = gql`
  mutation EventHallObjectDestroy($eventHallObjectDestroyId: ID!) {
    eventHallObjectDestroy(id: $eventHallObjectDestroyId) {
      id
      label
    }
  }
`;
