import { gql } from "@apollo/client";

import type { GenericStatus } from "@/shared/graphql";

export type RoleStatusEnum = GenericStatus;

export type RoleDateRangeInput = {
  /** Inclusive UTC datetime, `yyyy-MM-dd'T'HH:mm:ss'Z'`. */
  start?: string | null;
  end?: string | null;
};

/** Flat `RoleFilterInput` for `roleList`. */
export type RoleFilterInput = {
  name?: string | null;
  description?: string | null;
  status?: RoleStatusEnum | RoleStatusEnum[] | null;
  id?: string | string[] | null;
  createdAtRange?: RoleDateRangeInput | null;
};

export type RoleSortInput = {
  field: string;
  order: "asc" | "desc";
};

export type RolePaginationInput = {
  limit: number;
  page: number;
};

export type RoleListPageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalCount: number;
  pageSize: number;
  page: number;
  totalPagesCount: number;
};

/** Shared role payload fields used by list / find / mutations. */
export type RoleNode = {
  id: string;
  name: string;
  description: string | null;
  status: string | null;
  permissionKeys: string[] | null;
  createdAt: string | null;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
};

export type RoleListQueryData = {
  roleList: {
    pageInfo: RoleListPageInfo;
    rows: RoleNode[];
  } | null;
};

export type RoleListQueryVariables = {
  sort?: RoleSortInput[] | null | undefined;
  pagination?: RolePaginationInput | null | undefined;
  filters?: RoleFilterInput | null | undefined;
};

export function hasRoleListFilters(filters: RoleFilterInput | null | undefined): boolean {
  if (!filters) return false;
  return Object.values(filters).some((value) => {
    if (value == null || value === "") return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") {
      const range = value as RoleDateRangeInput;
      return Boolean(range.start || range.end);
    }
    return true;
  });
}

export const ROLE_LIST_QUERY = gql`
  query RoleList($filters: RoleFilterInput, $pagination: PaginationInput, $sort: [SortInput!]) {
    roleList(filters: $filters, pagination: $pagination, sort: $sort) {
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
        description
        status
        permissionKeys
        createdAt
        createdBy
        updatedAt
        updatedBy
      }
    }
  }
`;
