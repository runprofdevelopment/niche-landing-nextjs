import { gql } from "@apollo/client";

import type { GenericStatus } from "@/shared/graphql";

export type StaffUserStatus = GenericStatus | "pending";

export type StaffUserDateRangeInput = {
  /** Inclusive UTC datetime, `yyyy-MM-dd'T'HH:mm:ss'Z'`. */
  start?: string | null;
  end?: string | null;
};

/** Flat `UserFilterInput` for staff `userList`. */
export type StaffUserFilterInput = {
  createdAtRange?: StaffUserDateRangeInput | null;
  email?: string | null;
  fullName?: string | null;
  status?: StaffUserStatus | StaffUserStatus[] | null;
  roleIds?: string | string[] | null;
  id?: string | string[] | null;
};

export type StaffUserSortInput = {
  field: string;
  order: "asc" | "desc";
};

export type StaffUserPaginationInput = {
  limit: number;
  page: number;
};

export type StaffUserListPageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalCount: number;
  pageSize: number;
  page: number;
  totalPagesCount: number;
};

export type StaffUserAvatarNode = {
  id: string;
  name: string | null;
  publicUrl: string | null;
};

export type StaffUserRefNode = {
  id: string;
  fullName: string | null;
};

/** Shared user payload used by list + find. */
export type StaffUserNode = {
  id: string;
  email: string;
  emailVerified: boolean | null;
  disabled: boolean | null;
  fullName: string | null;
  countryCode: string | null;
  phoneNumber: string | null;
  formattedPhoneNumber: string | null;
  status: string | null;
  profileType: string | null;
  isOwner: boolean | null;
  permissions: string[] | null;
  roles: string[] | null;
  roleIds: string[] | null;
  displayRolesNames: string[] | null;
  rejectReason: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  avatar: StaffUserAvatarNode | null;
  createdByUser: StaffUserRefNode | null;
  updatedByUser: StaffUserRefNode | null;
};

export type StaffUserListQueryData = {
  userList: {
    pageInfo: StaffUserListPageInfo;
    rows: StaffUserNode[];
  } | null;
};

export type StaffUserListQueryVariables = {
  sort?: StaffUserSortInput[] | null | undefined;
  pagination?: StaffUserPaginationInput | null | undefined;
  filters?: StaffUserFilterInput | null | undefined;
};

export function hasStaffUserListFilters(filters: StaffUserFilterInput | null | undefined): boolean {
  if (!filters) return false;
  return Object.values(filters).some((value) => {
    if (value == null || value === "") return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") {
      const range = value as StaffUserDateRangeInput;
      return Boolean(range.start || range.end);
    }
    return true;
  });
}

export const STAFF_USER_FIELDS = `
  avatar {
    id
    name
    publicUrl
  }
  id
  email
  emailVerified
  disabled
  createdByUser {
    id
    fullName
  }
  countryCode
  displayRolesNames
  formattedPhoneNumber
  phoneNumber
  permissions
  rejectReason
  roles
  roleIds
  isOwner
  status
  updatedAt
  updatedByUser {
    id
    fullName
  }
  createdAt
  fullName
  profileType
`;

export const STAFF_USER_LIST_QUERY = gql`
  query UserList($filters: UserFilterInput, $pagination: PaginationInput, $sort: [SortInput!]) {
    userList(filters: $filters, pagination: $pagination, sort: $sort) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        totalCount
        pageSize
        page
        totalPagesCount
      }
      rows {
        avatar {
          id
          name
          publicUrl
        }
        id
        email
        emailVerified
        disabled
        createdByUser {
          id
          fullName
        }
        countryCode
        displayRolesNames
        formattedPhoneNumber
        phoneNumber
        permissions
        rejectReason
        roles
        roleIds
        isOwner
        status
        updatedAt
        updatedByUser {
          id
          fullName
        }
        createdAt
        fullName
        profileType
      }
    }
  }
`;
