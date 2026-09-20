import { gql } from "@apollo/client";

export type EventStaffRole = "staff" | "frontdesk";

export type EventStaffDateRangeInput = {
  start?: string | null;
  end?: string | null;
};

export type EventStaffFilterInput = {
  email?: string | null;
  createdAtRange?: EventStaffDateRangeInput | null;
  fullName?: string | null;
  id?: string | null;
  phoneNumber?: string | null;
  role?: EventStaffRole | null;
};

export type EventStaffSortInput = {
  field: string;
  order: "asc" | "desc";
};

export type EventStaffPaginationInput = {
  limit: number;
  page: number;
};

export type EventStaffListPageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalCount: number;
  pageSize: number;
  page: number;
  totalPagesCount: number;
};

export type EventStaffListRowNode = {
  id: string;
  eventId: string;
  role: string | null;
  fullName: string | null;
  email: string | null;
  phoneNumber: string | null;
  formattedPhoneNumber: string | null;
  countryCode: string | null;
  note: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type EventStaffListQueryData = {
  eventStaffList: {
    pageInfo: EventStaffListPageInfo;
    rows: EventStaffListRowNode[];
  } | null;
};

export type EventStaffListQueryVariables = {
  eventId: string;
  filters?: EventStaffFilterInput | null;
  pagination?: EventStaffPaginationInput | null;
  sort?: EventStaffSortInput[] | null;
};

export function hasEventStaffListFilters(
  filters: EventStaffFilterInput | null | undefined,
): filters is EventStaffFilterInput {
  if (!filters) return false;
  return Object.values(filters).some((value) => {
    if (value == null || value === "") return false;
    if (typeof value === "object") {
      return Object.values(value).some((part) => part != null && part !== "");
    }
    return true;
  });
}

export const EVENT_STAFF_LIST_QUERY = gql`
  query EventStaffList(
    $eventId: ID!
    $pagination: PaginationInput
    $sort: [SortInput!]
    $filters: EventStaffFilterInput
  ) {
    eventStaffList(eventId: $eventId, pagination: $pagination, sort: $sort, filters: $filters) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        totalCount
        pageSize
        page
        totalPagesCount
      }
      rows {
        role
        phoneNumber
        formattedPhoneNumber
        eventId
        email
        createdAt
        countryCode
        id
        fullName
        note
        updatedAt
      }
    }
  }
`;
