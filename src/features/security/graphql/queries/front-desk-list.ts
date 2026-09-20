import { gql } from "@apollo/client";

import type { SecurityMemberStatus } from "../../types";

export type FrontDeskDateRangeInput = {
  /** Inclusive UTC datetime, `yyyy-MM-dd'T'HH:mm:ss'Z'`. */
  start?: string | null;
  end?: string | null;
};

/** Flat `UserFilterInput` for `frontDeskList`. */
export type FrontDeskFilterInput = {
  gender?: string | null;
  fullName?: string | null;
  email?: string | null;
  createdAtRange?: FrontDeskDateRangeInput | null;
  status?: SecurityMemberStatus | SecurityMemberStatus[] | null;
  id?: string | null;
  formattedPhoneNumber?: string | null;
};

export type FrontDeskSortInput = {
  field: string;
  order: "asc" | "desc";
};

export type FrontDeskPaginationInput = {
  limit: number;
  page: number;
};

export type FrontDeskListPageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalCount: number;
  pageSize: number;
  page: number;
  totalPagesCount: number;
};

export type FrontDeskListRowNode = {
  id: string;
  status: string | null;
  fullName: string | null;
  email: string | null;
  countryCode: string | null;
  formattedPhoneNumber: string | null;
};

export type FrontDeskListQueryData = {
  frontDeskList: {
    pageInfo: FrontDeskListPageInfo;
    rows: FrontDeskListRowNode[];
  } | null;
};

export type FrontDeskListQueryVariables = {
  sort?: FrontDeskSortInput[] | null | undefined;
  pagination?: FrontDeskPaginationInput | null | undefined;
  filters?: FrontDeskFilterInput | null | undefined;
};

export function hasFrontDeskListFilters(filters: FrontDeskFilterInput | null | undefined): boolean {
  if (!filters) return false;
  return Object.values(filters).some((value) => {
    if (value == null || value === "") return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") {
      const range = value as FrontDeskDateRangeInput;
      return Boolean(range.start || range.end);
    }
    return true;
  });
}

export const FRONT_DESK_LIST_QUERY = gql`
  query FrontDeskList(
    $filters: UserFilterInput
    $pagination: PaginationInput
    $sort: [SortInput!]
  ) {
    frontDeskList(filters: $filters, pagination: $pagination, sort: $sort) {
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
        status
        fullName
        email
        countryCode
        formattedPhoneNumber
      }
    }
  }
`;
