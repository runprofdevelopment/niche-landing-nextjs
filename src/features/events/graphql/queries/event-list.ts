import { gql } from "@apollo/client";

/** Backend event list status enum. */
export type EventListStatus = "upcoming" | "live" | "completed";

/** Inclusive date range (`yyyy-MM-dd`) used by event list filters. */
export type EventDateRangeInput = {
  start?: string | null;
  end?: string | null;
};

/**
 * Flat filter object for `eventList`.
 * Named fields only — not an array of `{ field, value }` entries.
 */
export type EventFilterInput = {
  address?: string | null;
  brideName?: string | null;
  createdAtRange?: EventDateRangeInput | null;
  createdFrom?: string | null;
  eventDateRange?: EventDateRangeInput | null;
  groomName?: string | null;
  hallCapacity?: number | null;
  hallRef?: string | null;
  id?: string | null;
  language?: string | null;
  name?: string | null;
  numberOfGuests?: number | null;
  status?: EventListStatus | EventListStatus[] | null;
};

export type EventSortInput = {
  field: string;
  order: "asc" | "desc";
};

export type EventPaginationInput = {
  limit: number;
  page: number;
};

export type EventListPageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalCount: number;
  pageSize: number;
  page: number;
  totalPagesCount: number;
};

/** Raw row from `eventList.rows` — field names match the backend contract. */
export type EventListRowNode = {
  id: string;
  name: string;
  eventType: string | null;
  date: string;
  startTime: string;
  endTime: string;
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
  status: EventListStatus | null;
  ownerId: string | null;
  owner: {
    id: string;
    fullName: string | null;
  } | null;
};

export type EventListQueryData = {
  eventList: {
    pageInfo: EventListPageInfo;
    rows: EventListRowNode[];
  } | null;
};

export type EventListQueryVariables = {
  sort?: EventSortInput[] | null | undefined;
  pagination?: EventPaginationInput | null | undefined;
  filters?: EventFilterInput | null | undefined;
};

export function hasEventListFilters(filters: EventFilterInput | null | undefined): boolean {
  if (!filters) return false;
  return Object.values(filters).some((value) => {
    if (value == null || value === "") return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") {
      const range = value as EventDateRangeInput;
      return Boolean(range.start || range.end);
    }
    return true;
  });
}

export const EVENT_LIST_QUERY = gql`
  query EventList($sort: [SortInput!], $pagination: PaginationInput, $filters: EventFilterInput) {
    eventList(sort: $sort, pagination: $pagination, filters: $filters) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        totalCount
        pageSize
        page
        totalPagesCount
      }
      rows {
        id
        name
        eventType
        date
        startTime
        endTime
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
        status
        ownerId
        owner {
          id
          fullName
        }
      }
    }
  }
`;
