import { gql } from "@apollo/client";

export type EventTimelineFindNode = {
  id: string;
  eventId: string;
  endTime: string;
  startTime: string;
  title: string;
  updatedAt: string | null;
  description: string | null;
  createdAt: string | null;
};

export type EventTimelineFindQueryData = {
  eventTimelineFind: EventTimelineFindNode | null;
};

export type EventTimelineFindQueryVariables = {
  eventTimelineFindId: string;
};

export const EVENT_TIMELINE_FIND_QUERY = gql`
  query EventTimelineFind($eventTimelineFindId: ID!) {
    eventTimelineFind(id: $eventTimelineFindId) {
      id
      eventId
      endTime
      startTime
      title
      updatedAt
      description
      createdAt
    }
  }
`;
