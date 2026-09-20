import { gql } from "@apollo/client";

import type {
  EventHallBoundaryInput,
  EventHallCoordinateSystem,
  EventHallTableTemplateInput,
} from "../queries/event-hall-shared";

export type EventHallCreateInput = {
  eventId: string;
  name: string;
  coordinateSystem: EventHallCoordinateSystem;
  boundary: EventHallBoundaryInput;
  tableTemplates: EventHallTableTemplateInput[];
  status?: string | null;
};

export type EventHallCreateResult = {
  id: string;
  eventId: string;
  name: string;
};

export type EventHallCreateMutationData = {
  eventHallCreate: EventHallCreateResult;
};

export const EVENT_HALL_CREATE_MUTATION = gql`
  mutation EventHallCreate($data: CreateEventHallInput!) {
    eventHallCreate(data: $data) {
      id
      eventId
      name
    }
  }
`;
