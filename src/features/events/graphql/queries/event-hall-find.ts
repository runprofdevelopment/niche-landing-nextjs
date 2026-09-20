import { gql } from "@apollo/client";

import type { EventHallListNode } from "./event-hall-list";

export type EventHallFindNode = EventHallListNode;

export type EventHallFindQueryData = {
  eventHallFind: EventHallFindNode | null;
};

export type EventHallFindQueryVariables = {
  eventHallFindId: string;
};

export const EVENT_HALL_FIND_QUERY = gql`
  query EventHallFind($eventHallFindId: ID!) {
    eventHallFind(id: $eventHallFindId) {
      id
      eventId
      name
      coordinateSystem {
        height
        width
      }
      boundary {
        height
        heightMeters
        points {
          x
          y
        }
        radius
        shape
        width
        widthMeters
        x
        y
      }
      tableTemplates {
        capacity
        id
        numberOfTables
        seatNaming
        tableNaming
        tableShape
        createdObjectCount
      }
      status
      layoutVersion
      createdAt
      updatedAt
      createdBy
      updatedBy
    }
  }
`;
