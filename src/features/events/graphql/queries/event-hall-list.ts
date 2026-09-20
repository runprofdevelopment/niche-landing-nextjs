import { gql } from "@apollo/client";

import type {
  EventHallBoundaryNode,
  EventHallCoordinateSystem,
  EventHallTableTemplateNode,
} from "./event-hall-shared";

export type EventHallListNode = {
  id: string;
  eventId: string;
  layoutVersion: number | null;
  name: string;
  status: string | null;
  tableTemplates: EventHallTableTemplateNode[] | null;
  updatedAt: string | null;
  updatedBy: string | null;
  createdBy: string | null;
  createdAt: string | null;
  boundary: EventHallBoundaryNode | null;
  coordinateSystem: EventHallCoordinateSystem | null;
};

export type EventHallListQueryData = {
  eventHallList: EventHallListNode[];
};

export type EventHallListQueryVariables = {
  eventId: string;
};

export const EVENT_HALL_LIST_QUERY = gql`
  query EventHallList($eventId: ID!) {
    eventHallList(eventId: $eventId) {
      id
      eventId
      layoutVersion
      name
      status
      tableTemplates {
        capacity
        id
        numberOfTables
        seatNaming
        tableNaming
        tableShape
        createdObjectCount
      }
      updatedAt
      updatedBy
      createdBy
      createdAt
      boundary {
        radius
        shape
        width
        widthMeters
        heightMeters
        x
        y
        points {
          x
          y
        }
        height
      }
      coordinateSystem {
        height
        width
      }
    }
  }
`;
