import { gql } from "@apollo/client";

import type {
  EventHallBoundaryInput,
  EventHallCoordinateSystem,
  EventHallTableTemplateInput,
} from "../queries/event-hall-shared";

export type EventHallUpdateInput = {
  name?: string | null;
  status?: string | null;
  coordinateSystem?: EventHallCoordinateSystem | null;
  boundary?: EventHallBoundaryInput | null;
  tableTemplates?: EventHallTableTemplateInput[] | null;
};

export type EventHallUpdateResult = {
  id: string;
  name: string;
  layoutVersion: number | null;
  status: string | null;
};

export type EventHallUpdateMutationData = {
  eventHallUpdate: EventHallUpdateResult;
};

export type EventHallUpdateMutationVariables = {
  eventHallUpdateId: string;
  data: EventHallUpdateInput;
};

export const EVENT_HALL_UPDATE_MUTATION = gql`
  mutation EventHallUpdate($eventHallUpdateId: ID!, $data: UpdateEventHallInput!) {
    eventHallUpdate(id: $eventHallUpdateId, data: $data) {
      id
      name
      layoutVersion
      status
    }
  }
`;
