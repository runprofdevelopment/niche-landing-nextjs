import { gql } from "@apollo/client";

export type UpdateEventTimelineInput = {
  title?: string | null;
  description?: string | null;
  startTime?: string | null;
  endTime?: string | null;
};

export type EventTimelineUpdateMutationData = {
  eventTimelineUpdate: { id: string } | null;
};

export type EventTimelineUpdateMutationVariables = {
  eventTimelineUpdateId: string;
  data: UpdateEventTimelineInput;
};

export const EVENT_TIMELINE_UPDATE_MUTATION = gql`
  mutation EventTimelineUpdate($eventTimelineUpdateId: ID!, $data: UpdateEventTimelineInput!) {
    eventTimelineUpdate(id: $eventTimelineUpdateId, data: $data) {
      id
    }
  }
`;
