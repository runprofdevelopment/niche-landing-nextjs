import { gql } from "@apollo/client";

export type InvitationTemplateFilterInput = {
  id?: string | null;
  language?: string | null;
  layout?: string | null;
  name?: string | null;
};

export type InvitationTemplateSortInput = {
  field: string;
  order: "asc" | "desc";
};

export type InvitationTemplatePaginationInput = {
  limit: number;
  page: number;
};

export type InvitationTemplateListPageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalCount: number;
  pageSize: number;
  page: number;
  totalPagesCount: number;
};

export type InvitationTemplateListRowNode = {
  id: string;
  html: string | null;
  accent: string | null;
  background: string | null;
  bodyFont: string | null;
  createdAt: string | null;
  templateImageUrl: string | null;
  namesFontSize: number | null;
  name: string | null;
  layout: string | null;
  language: string | null;
  headingFont: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  updatedAt: string | null;
};

export type InvitationTemplateListQueryData = {
  invitationTemplateList: {
    pageInfo: InvitationTemplateListPageInfo;
    rows: InvitationTemplateListRowNode[];
  } | null;
};

export type InvitationTemplateListQueryVariables = {
  filters?: InvitationTemplateFilterInput | null;
  pagination?: InvitationTemplatePaginationInput | null;
  sort?: InvitationTemplateSortInput[] | null;
};

export function hasInvitationTemplateListFilters(
  filters: InvitationTemplateFilterInput | null | undefined,
): filters is InvitationTemplateFilterInput {
  if (!filters) return false;
  return Object.values(filters).some((value) => value != null && value !== "");
}

export const INVITATION_TEMPLATE_LIST_QUERY = gql`
  query InvitationTemplateList(
    $filters: InvitationTemplateFilterInput
    $pagination: PaginationInput
    $sort: [SortInput!]
  ) {
    invitationTemplateList(filters: $filters, pagination: $pagination, sort: $sort) {
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
        html
        accent
        background
        bodyFont
        createdAt
        templateImageUrl
        namesFontSize
        name
        layout
        language
        headingFont
        createdBy
        updatedBy
        updatedAt
      }
    }
  }
`;
