import { gql } from "@apollo/client";

export type EventTableRosterGuest = {
  id: string;
  name: string | null;
};

export type EventTableRosterSeat = {
  id: string;
  seatIndex: number | null;
  guest: EventTableRosterGuest | null;
  guestId: string | null;
  hallId: string | null;
};

export type EventTableRosterQueryData = {
  eventTableRoster: {
    seats: EventTableRosterSeat[];
  } | null;
};

export type EventTableRosterQueryVariables = {
  tableId: string;
};

/**
 * Seats only — never select `table { id … }`.
 * That field shares EventHallObject ids; Apollo merges wipe reservedSeats and clear greens.
 */
export const EVENT_TABLE_ROSTER_QUERY = gql`
  query EventTableRoster($tableId: ID!) {
    eventTableRoster(tableId: $tableId) {
      seats {
        id
        seatIndex
        guest {
          id
          name
        }
        guestId
        hallId
      }
    }
  }
`;
