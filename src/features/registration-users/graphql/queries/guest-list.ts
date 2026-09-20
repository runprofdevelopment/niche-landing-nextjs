import { gql } from "@apollo/client";

import type { GuestType } from "../../constants";

export type GuestUserDateRangeInput = {
  start?: string | null;
  end?: string | null;
};

/** Flat `UserFilterInput` for `guestList`. */
export type GuestUserFilterInput = {
  createdAtRange?: GuestUserDateRangeInput | null;
  email?: string | null;
  fullName?: string | null;
  guestType?: GuestType | GuestType[] | null;
  status?: string | string[] | null;
  id?: string | string[] | null;
};

export type GuestUserSortInput = {
  field: string;
  order: "asc" | "desc";
};

export type GuestUserPaginationInput = {
  limit: number;
  page: number;
};

export type GuestUserListPageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalCount: number;
  pageSize: number;
  page: number;
  totalPagesCount: number;
};

export type GuestUserAvatarNode = {
  id: string;
  name: string | null;
  publicUrl: string | null;
};

export type GuestUserRefNode = {
  id: string;
  fullName: string | null;
};

export type GuestUserNode = {
  id: string;
  email: string;
  fullName: string | null;
  guestType: string | null;
  emailVerified: boolean | null;
  isOwner: boolean | null;
  phoneNumber: string | null;
  status: string | null;
  updatedAt: string | null;
  createdAt?: string | null;
  countryCode: string | null;
  formattedPhoneNumber: string | null;
  profileType: string | null;
  avatar: GuestUserAvatarNode | null;
  updatedByUser: GuestUserRefNode | null;
};

export type GuestListQueryData = {
  guestList: {
    pageInfo: GuestUserListPageInfo;
    rows: GuestUserNode[];
  } | null;
};

export type GuestListQueryVariables = {
  filters?: GuestUserFilterInput | null | undefined;
  pagination?: GuestUserPaginationInput | null | undefined;
  sort?: GuestUserSortInput[] | null | undefined;
};

export function hasGuestListFilters(filters: GuestUserFilterInput | null | undefined): boolean {
  if (!filters) return false;
  return Object.values(filters).some((value) => {
    if (value == null || value === "") return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") {
      const range = value as GuestUserDateRangeInput;
      return Boolean(range.start || range.end);
    }
    return true;
  });
}

export const GUEST_LIST_QUERY = gql`
  query GuestList($filters: UserFilterInput, $pagination: PaginationInput, $sort: [SortInput!]) {
    guestList(filters: $filters, pagination: $pagination, sort: $sort) {
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
        fullName
        id
        guestType
        emailVerified
        isOwner
        phoneNumber
        status
        updatedAt
        updatedByUser {
          id
          fullName
        }
        avatar {
          id
          publicUrl
          name
        }
        countryCode
        formattedPhoneNumber
        profileType
      }
    }
  }
`;
