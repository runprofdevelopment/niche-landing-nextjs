import { gql } from "@apollo/client";

export type ContactUsCommentUpdateInput = {
  comment: string;
};

export type ContactUsCommentUpdateMutationData = {
  contactUsCommentUpdate: { id: string } | null;
};

export type ContactUsCommentUpdateMutationVariables = {
  contactUsCommentUpdateId: string;
  data: ContactUsCommentUpdateInput;
};

export const CONTACT_US_COMMENT_UPDATE_MUTATION = gql`
  mutation ContactUsCommentUpdate(
    $contactUsCommentUpdateId: ID!
    $data: ContactUsCommentUpdateInput!
  ) {
    contactUsCommentUpdate(id: $contactUsCommentUpdateId, data: $data) {
      id
    }
  }
`;
