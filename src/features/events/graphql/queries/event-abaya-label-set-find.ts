import { gql } from "@apollo/client";

/** Raw node from `eventAbayaLabelSetFind`. */
export type EventAbayaLabelSetNode = {
  id: string;
  eventId: string;
  prefix: string | null;
  suffix: string | null;
  from: number | null;
  to: number | null;
  totalLabels: number | null;
  assignedLabels: number | null;
  availableLabels: number | null;
  createdAt: string | null;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
};

export type EventAbayaLabelSetFindQueryData = {
  eventAbayaLabelSetFind: EventAbayaLabelSetNode | null;
};

export type EventAbayaLabelSetFindQueryVariables = {
  eventId: string;
};

export const EVENT_ABAYA_LABEL_SET_FIND_QUERY = gql`
  query EventAbayaLabelSetFind($eventId: ID!) {
    eventAbayaLabelSetFind(eventId: $eventId) {
      assignedLabels
      availableLabels
      createdAt
      createdBy
      eventId
      from
      id
      prefix
      suffix
      to
      totalLabels
      updatedAt
      updatedBy
    }
  }
`;
