import { gql } from "@apollo/client";

export type EventTimelineDestroyMutationData = {
  eventTimelineDestroy: { id: string } | null;
};

export type EventTimelineDestroyMutationVariables = {
  eventTimelineDestroyId: string;
};

export const EVENT_TIMELINE_DESTROY_MUTATION = gql`
  mutation EventTimelineDestroy($eventTimelineDestroyId: ID!) {
    eventTimelineDestroy(id: $eventTimelineDestroyId) {
      id
    }
  }
`;
