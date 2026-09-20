import { gql } from "@apollo/client";

export type EventGuestSeatMapMember = {
  id: string;
  name: string | null;
  /** Present when the guest is already seated; blocks drag until unseat. */
  seatId: string | null;
};

export type EventGuestSeatMapGroup = {
  id: string;
  count: number | null;
  parent: EventGuestSeatMapMember | null;
  members: EventGuestSeatMapMember[];
};

export type EventGuestSeatMapListQueryData = {
  eventGuestSeatMapList: {
    groups: EventGuestSeatMapGroup[];
    individuals: EventGuestSeatMapMember[];
  } | null;
};

export type EventGuestSeatMapListQueryVariables = {
  eventId: string;
};

export const EVENT_GUEST_SEAT_MAP_LIST_QUERY = gql`
  query EventGuestSeatMapList($eventId: ID!) {
    eventGuestSeatMapList(eventId: $eventId) {
      groups {
        parent {
          id
          name
          seatId
        }
        id
        count
        members {
          id
          name
          seatId
        }
      }
      individuals {
        id
        name
        seatId
      }
    }
  }
`;
