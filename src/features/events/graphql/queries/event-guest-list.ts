import { gql } from "@apollo/client";

export type EventGuestStatus = "expected" | "confirmed" | "cancelled";
export type EventGuestGender = "male" | "female" | "NA";

export type EventGuestDateRangeInput = {
  start?: string | null;
  end?: string | null;
};

export type EventGuestFilterInput = {
  email?: string | null;
  formattedPhoneNumber?: string | null;
  gender?: EventGuestGender | null;
  id?: string | null;
  name?: string | null;
  status?: EventGuestStatus | null;
  createdAtRange?: EventGuestDateRangeInput | null;
};

export type EventGuestSortInput = {
  field: string;
  direction: "asc" | "desc";
};

export type EventGuestPaginationInput = {
  limit: number;
  page: number;
};

export type EventGuestListPageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalCount: number;
  pageSize: number;
  page: number;
  totalPagesCount: number;
};

export type EventGuestCompanionNode = {
  id: string;
  name: string | null;
  email: string | null;
};

export type EventGuestQrCodeNode = {
  id: string;
  name: string | null;
  publicUrl: string | null;
};

export type EventGuestAbayaLabelNode = {
  id: string;
};

export type EventGuestListRow = {
  id: string;
  eventId: string;
  name: string | null;
  email: string | null;
  gender: string | null;
  phoneNumber: string | null;
  countryCode: string | null;
  formattedPhoneNumber: string | null;
  status: string | null;
  parentGuestId: string | null;
  numberOfCompanions: number | null;
  companions: EventGuestCompanionNode[] | null;
  invitationSent: boolean | null;
  checkedIn: boolean | null;
  qrCode: EventGuestQrCodeNode | null;
  abayaLabelId: string | null;
  abayaLabel: EventGuestAbayaLabelNode | null;
  code: string | null;
  seatId: string | null;
  seatNumber: string | number | null;
  tableNumber: string | number | null;
  createdAt: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
};

export type EventGuestListQueryData = {
  eventGuestList: {
    pageInfo: EventGuestListPageInfo;
    rows: EventGuestListRow[];
  } | null;
};

export type EventGuestListQueryVariables = {
  eventId: string;
  filters?: EventGuestFilterInput | null;
  pagination?: EventGuestPaginationInput | null;
  sort?: EventGuestSortInput[] | null;
};

export function hasEventGuestListFilters(
  filters: EventGuestFilterInput | null | undefined,
): filters is EventGuestFilterInput {
  if (!filters) return false;
  return Object.values(filters).some((value) => value != null && value !== "");
}

export const EVENT_GUEST_LIST_QUERY = gql`
  query EventGuestList(
    $eventId: ID!
    $filters: EventGuestFilterInput
    $pagination: PaginationInput
    $sort: [SortInput!]
  ) {
    eventGuestList(eventId: $eventId, filters: $filters, pagination: $pagination, sort: $sort) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        totalCount
        pageSize
        page
        totalPagesCount
      }
      rows {
        email
        id
        gender
        eventId
        name
        phoneNumber
        status
        parentGuestId
        companions {
          id
          name
          email
        }
        countryCode
        formattedPhoneNumber
        numberOfCompanions
        invitationSent
        checkedIn
        qrCode {
          id
          name
          publicUrl
        }
        abayaLabelId
        abayaLabel {
          id
        }
        code
        seatId
        seatNumber
        tableNumber
        updatedAt
        updatedBy
        createdAt
      }
    }
  }
`;
