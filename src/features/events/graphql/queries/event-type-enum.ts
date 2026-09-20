import { gql } from "@apollo/client";

export type EventTypeEnumItem = {
  id: string;
  label: string;
};

export type EventTypeEnumQueryData = {
  eventTypeEnum: EventTypeEnumItem[];
};

export const EVENT_TYPE_ENUM_QUERY = gql`
  query EventTypeEnum {
    eventTypeEnum {
      id
      label
    }
  }
`;
