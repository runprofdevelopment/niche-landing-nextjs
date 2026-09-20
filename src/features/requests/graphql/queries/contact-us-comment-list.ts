import { gql } from "@apollo/client";

export type ContactUsCommentNode = {
  id: string;
  contactUsId: string | null;
  comment: string | null;
  createdAt: string | null;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  employee: {
    id: string;
    fullName: string | null;
  } | null;
};

export type ContactUsCommentListQueryData = {
  contactUsCommentList: ContactUsCommentNode[] | null;
};

export type ContactUsCommentListQueryVariables = {
  contactUsId: string;
};

export const CONTACT_US_COMMENT_LIST_QUERY = gql`
  query ContactUsCommentList($contactUsId: ID!) {
    contactUsCommentList(contactUsId: $contactUsId) {
      comment
      contactUsId
      createdAt
      createdBy
      employee {
        fullName
        id
      }
      id
      updatedAt
      updatedBy
    }
  }
`;
