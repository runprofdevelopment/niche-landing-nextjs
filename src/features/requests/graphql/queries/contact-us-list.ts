import { gql } from "@apollo/client";

import type { ContactUsStatus } from "../../types";

export type ContactUsDateRangeInput = {
  /** Inclusive UTC datetime, `yyyy-MM-dd'T'HH:mm:ss'Z'`. */
  start?: string | null;
  end?: string | null;
};

/** Flat `ContactUsFilterInput` for `contactUsList`. */
export type ContactUsFilterInput = {
  customerName?: string | null;
  email?: string | null;
  createdAtRange?: ContactUsDateRangeInput | null;
  eventType?: string | null;
  status?: ContactUsStatus | null;
  phoneNumber?: string | null;
  id?: string | null;
};

export type ContactUsSortInput = {
  field: string;
  order: "asc" | "desc";
};

export type ContactUsPaginationInput = {
  limit: number;
  page: number;
};

export type ContactUsListPageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalCount: number;
  pageSize: number;
  page: number;
  totalPagesCount: number;
};

export type ContactUsListRowNode = {
  id: string;
  countryCode: string | null;
  eventType: string | null;
  phoneNumber: string | null;
  time: string | null;
  customerName: string | null;
  date: string | null;
  email: string | null;
  createdAt: string | null;
  createdBy: string | null;
  message: string | null;
  status: string | null;
};

export type ContactUsListQueryData = {
  contactUsList: {
    pageInfo: ContactUsListPageInfo;
    rows: ContactUsListRowNode[];
  } | null;
};

export type ContactUsListQueryVariables = {
  sort?: ContactUsSortInput[] | null | undefined;
  pagination?: ContactUsPaginationInput | null | undefined;
  filters?: ContactUsFilterInput | null | undefined;
};

export function hasContactUsListFilters(filters: ContactUsFilterInput | null | undefined): boolean {
  if (!filters) return false;
  return Object.values(filters).some((value) => {
    if (value == null || value === "") return false;
    if (typeof value === "object") {
      const range = value as ContactUsDateRangeInput;
      return Boolean(range.start || range.end);
    }
    return true;
  });
}

export const CONTACT_US_LIST_QUERY = gql`
  query ContactUsList(
    $filters: ContactUsFilterInput
    $pagination: PaginationInput
    $sort: [SortInput!]
  ) {
    contactUsList(filters: $filters, pagination: $pagination, sort: $sort) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        totalCount
        pageSize
        page
        totalPagesCount
      }
      rows {
        countryCode
        eventType
        phoneNumber
        time
        customerName
        date
        email
        createdAt
        createdBy
        message
        id
        status
      }
    }
  }
`;
