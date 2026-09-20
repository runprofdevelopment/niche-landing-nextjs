import { gql } from "@apollo/client";

export type ContactUsCommentCreateInput = {
  comment: string;
  contactUsId: string;
};

export type ContactUsCommentCreateMutationData = {
  contactUsCommentCreate: { id: string } | null;
};

export type ContactUsCommentCreateMutationVariables = {
  data: ContactUsCommentCreateInput;
};

export const CONTACT_US_COMMENT_CREATE_MUTATION = gql`
  mutation ContactUsRequestCreate($data: ContactUsCommentCreateInput!) {
    contactUsCommentCreate(data: $data) {
      id
    }
  }
`;
