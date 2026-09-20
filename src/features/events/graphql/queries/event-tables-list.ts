import { gql } from "@apollo/client";

export type EventTableAssignedGuestNode = {
  id: string;
  name: string | null;
  email: string | null;
};

export type EventTableFilterInput = {
  id?: string | null;
  name?: string | null;
  label?: string | null;
  tableNumber?: number | null;
  capacity?: number | null;
};

export type EventTableSortInput = {
  field: string;
  order: "asc" | "desc";
};

export type EventTablePaginationInput = {
  limit: number;
  page: number;
};

export type EventTablesListPageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalCount: number;
  pageSize: number;
  page: number;
  totalPagesCount: number;
};

export type EventTablesListRowNode = {
  id: string;
  assignedGuests: EventTableAssignedGuestNode[] | null;
  capacity: number | null;
  label: string | null;
  name: string | null;
  tableNumber: number | null;
};

export type EventTablesListQueryData = {
  eventTablesList: {
    pageInfo: EventTablesListPageInfo;
    rows: EventTablesListRowNode[];
  } | null;
};

export type EventTablesListQueryVariables = {
  eventId: string;
  filters?: EventTableFilterInput | null;
  pagination?: EventTablePaginationInput | null;
  sort?: EventTableSortInput[] | null;
};

export function hasEventTablesListFilters(
  filters: EventTableFilterInput | null | undefined,
): filters is EventTableFilterInput {
  if (!filters) return false;
  return Object.values(filters).some((value) => value != null && value !== "");
}

export const EVENT_TABLES_LIST_QUERY = gql`
  query EventTablesList(
    $eventId: ID!
    $pagination: PaginationInput
    $sort: [SortInput!]
    $filters: EventTableFilterInput
  ) {
    eventTablesList(eventId: $eventId, pagination: $pagination, sort: $sort, filters: $filters) {
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
        assignedGuests {
          id
          name
          email
        }
        capacity
        label
        name
        tableNumber
      }
    }
  }
`;
