import { gql } from "@apollo/client";

export type EventDestroyResult = {
  id: string;
};

export type EventDestroyMutationData = {
  eventDestroy: EventDestroyResult | null;
};

export type EventDestroyMutationVariables = {
  eventDestroyId: string;
};

export const EVENT_DESTROY_MUTATION = gql`
  mutation EventDestroy($eventDestroyId: ID!) {
    eventDestroy(id: $eventDestroyId) {
      id
    }
  }
`;
