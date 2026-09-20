import { gql } from "@apollo/client";

export type EventTimelineListNode = {
  id: string;
  title: string;
  description: string | null;
  createdAt: string | null;
  endTime: string;
  eventId: string;
  startTime: string;
};

export type EventTimelineListQueryData = {
  eventTimelineList: EventTimelineListNode[] | null;
};

export type EventTimelineListQueryVariables = {
  eventId: string;
};

export const EVENT_TIMELINE_LIST_QUERY = gql`
  query EventTimelineList($eventId: ID!) {
    eventTimelineList(eventId: $eventId) {
      id
      title
      description
      createdAt
      endTime
      eventId
      startTime
    }
  }
`;
