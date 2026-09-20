import { gql } from "@apollo/client";

export type EventHallObjectTableNode = {
  capacity: number | null;
  reservedSeats: number | null;
  shape: string | null;
};

export type EventHallObjectTransformNode = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
};

export type EventHallObjectNode = {
  id: string;
  eventId: string;
  eventHallId: string;
  geometry: string | null;
  label: string | null;
  table: EventHallObjectTableNode | null;
  templateId: string | null;
  transform: EventHallObjectTransformNode | null;
  type: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  createdAt: string | null;
  createdBy?: string | null;
};

export type EventHallObjectListQueryData = {
  eventHallObjectList: EventHallObjectNode[];
};

export type EventHallObjectListQueryVariables = {
  eventId: string;
  eventHallId: string;
};

export const EVENT_HALL_OBJECT_LIST_QUERY = gql`
  query EventHallObjectList($eventId: ID!, $eventHallId: ID!) {
    eventHallObjectList(eventId: $eventId, eventHallId: $eventHallId) {
      label
      id
      table {
        capacity
        reservedSeats
        shape
      }
      eventId
      eventHallId
      geometry
      templateId
      transform {
        x
        y
        width
        height
        rotation
        zIndex
      }
      type
      updatedAt
      updatedBy
      createdBy
      createdAt
    }
  }
`;
