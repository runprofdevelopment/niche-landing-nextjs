import { gql } from "@apollo/client";

export type CreateEventTimelineInput = {
  eventId: string;
  title: string;
  description?: string | null;
  startTime: string;
  endTime: string;
};

export type EventTimelineCreateMutationData = {
  eventTimelineCreate: { id: string; title: string } | null;
};

export type EventTimelineCreateMutationVariables = {
  data: CreateEventTimelineInput;
};

export const EVENT_TIMELINE_CREATE_MUTATION = gql`
  mutation EventTimelineCreate($data: CreateEventTimelineInput!) {
    eventTimelineCreate(data: $data) {
      id
      title
    }
  }
`;
