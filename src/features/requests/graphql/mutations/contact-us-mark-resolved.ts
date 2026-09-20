import { gql } from "@apollo/client";

export type ContactUsMarkResolvedMutationData = {
  contactUsRequestMarkResolved: { id: string } | null;
};

export type ContactUsMarkResolvedMutationVariables = {
  contactUsRequestMarkResolvedId: string;
};

export const CONTACT_US_MARK_RESOLVED_MUTATION = gql`
  mutation ContactUsRequestMarkResolved($contactUsRequestMarkResolvedId: ID!) {
    contactUsRequestMarkResolved(id: $contactUsRequestMarkResolvedId) {
      id
    }
  }
`;
