import { gql } from "@apollo/client";

import type { EventListStatus } from "./event-list";

/** Raw node from `eventFind` — field names match the backend contract. */
export type EventFindNode = {
  id: string;
  name: string;
  eventType: string | null;
  date: string;
  startTime: string;
  endTime: string;
  eventDateTime: string | null;
  eventEndDateTime: string | null;
  status: EventListStatus | null;
  brideName: string | null;
  groomName: string | null;
  hallCapacity: number | null;
  numberOfGuests: number | null;
  language: string | null;
  address: string | null;
  hallRef: string | null;
  googleMapUrl: string | null;
  eventHallIds: string[] | null;
  eventSeatMapIds: string[] | null;
  createdFrom: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  ownerId: string | null;
  owner: {
    id: string;
    fullName: string | null;
  } | null;
};

export type EventSetupModuleProgressNode = {
  completed: boolean;
};

export type EventSetupHallProgressNode = EventSetupModuleProgressNode & {
  hallIds: string[] | null;
};

export type EventSetupGuestListProgressNode = EventSetupModuleProgressNode & {
  guestCount: number | null;
  numberOfGuests: number | null;
};

export type EventSetupSeatMappingProgressNode = EventSetupModuleProgressNode & {
  eventSeatMapIds: string[] | null;
};

export type EventSetupTablesProgressNode = EventSetupModuleProgressNode & {
  numberOfGuests: number | null;
  totalCapacity: number | null;
};

/** Raw node from `eventSetupProgressFind`. */
export type EventSetupProgressNode = {
  eventId: string;
  completedCount: number;
  totalCount: number;
  percentComplete: number;
  hallSetup: EventSetupHallProgressNode | null;
  guestList: EventSetupGuestListProgressNode | null;
  seatMapping: EventSetupSeatMappingProgressNode | null;
  invitations: EventSetupModuleProgressNode | null;
  timeline: EventSetupModuleProgressNode | null;
  checkIn: EventSetupModuleProgressNode | null;
  abayaLabels: EventSetupModuleProgressNode | null;
  eventStaff: EventSetupModuleProgressNode | null;
  eventTables: EventSetupTablesProgressNode | null;
};

export type EventStatMetricNode = {
  count: number;
  /** Backend already includes the `%` suffix (e.g. `"42%"`). */
  percent: string;
};

/** Raw node from `eventStatsFind`. */
export type EventStatsNode = {
  eventId: string;
  totalGuests: number;
  expected: EventStatMetricNode | null;
  invitationsSent: EventStatMetricNode | null;
  rsvpsConfirmed: EventStatMetricNode | null;
  checkedIn: EventStatMetricNode | null;
};

export type EventFindQueryData = {
  eventFind: EventFindNode | null;
  eventSetupProgressFind: EventSetupProgressNode | null;
  eventStatsFind: EventStatsNode | null;
};

export type EventFindQueryVariables = {
  eventId: string;
};

export const EVENT_FIND_QUERY = gql`
  query EventFind($eventId: ID!) {
    eventFind(id: $eventId) {
      id
      name
      eventType
      date
      startTime
      endTime
      eventDateTime
      eventEndDateTime
      status
      brideName
      groomName
      hallCapacity
      numberOfGuests
      language
      address
      hallRef
      googleMapUrl
      eventHallIds
      eventSeatMapIds
      createdFrom
      createdAt
      updatedAt
      createdBy
      updatedBy
      ownerId
      owner {
        id
        fullName
      }
    }
    eventSetupProgressFind(eventId: $eventId) {
      eventId
      completedCount
      totalCount
      percentComplete
      hallSetup {
        completed
        hallIds
      }
      guestList {
        completed
        guestCount
        numberOfGuests
      }
      seatMapping {
        completed
        eventSeatMapIds
      }
      invitations {
        completed
      }
      timeline {
        completed
      }
      checkIn {
        completed
      }
      abayaLabels {
        completed
      }
      eventStaff {
        completed
      }
      eventTables {
        completed
        numberOfGuests
        totalCapacity
      }
    }
    eventStatsFind(eventId: $eventId) {
      eventId
      totalGuests
      expected {
        count
        percent
      }
      invitationsSent {
        count
        percent
      }
      rsvpsConfirmed {
        count
        percent
      }
      checkedIn {
        count
        percent
      }
    }
  }
`;
