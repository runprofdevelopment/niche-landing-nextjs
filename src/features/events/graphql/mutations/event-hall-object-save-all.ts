import { gql } from "@apollo/client";

export type EventHallObjectTableInput = {
  capacity: number;
  shape: string;
};

export type EventHallObjectTransformInput = {
  height: number;
  rotation: number;
  width: number;
  x: number;
  y: number;
  zIndex: number;
};

export type SaveEventHallObjectInput = {
  /** Present when updating an existing object from `EventHallObjectList`. */
  id?: string | null;
  templateId?: string | null;
  table?: EventHallObjectTableInput | null;
  label: string;
  type: string;
  transform: EventHallObjectTransformInput;
  geometry?: string | null;
};

export type SaveEventHallObjectsInput = {
  eventHallId: string;
  eventId: string;
  objects: SaveEventHallObjectInput[];
};

export type EventHallObjectSaveAllResult = {
  id: string;
  updatedAt: string | null;
  eventHallId: string;
  eventId: string;
};

export type EventHallObjectSaveAllMutationData = {
  eventHallObjectSaveAll: EventHallObjectSaveAllResult | EventHallObjectSaveAllResult[] | null;
};

export type EventHallObjectSaveAllMutationVariables = {
  data: SaveEventHallObjectsInput;
};

export const EVENT_HALL_OBJECT_SAVE_ALL_MUTATION = gql`
  mutation EventHallObjectSaveAll($data: SaveEventHallObjectsInput!) {
    eventHallObjectSaveAll(data: $data) {
      id
      updatedAt
      eventHallId
      eventId
    }
  }
`;
