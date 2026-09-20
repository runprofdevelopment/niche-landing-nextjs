import { gql } from "@apollo/client";

export type EventGuestFindByCodeNode = {
  id: string;
  name: string | null;
  email: string | null;
};

export type EventGuestFindByCodeQueryData = {
  eventGuestFindByCode: EventGuestFindByCodeNode | null;
};

export type EventGuestFindByCodeQueryVariables = {
  eventId: string;
  code: string;
};

export const EVENT_GUEST_FIND_BY_CODE_QUERY = gql`
  query EventGuestFindByCode($eventId: ID!, $code: String!) {
    eventGuestFindByCode(eventId: $eventId, code: $code) {
      email
      id
      name
    }
  }
`;
