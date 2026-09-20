import { gql } from "@apollo/client";

export type FrontDeskRejectMutationData = {
  frontDeskReject: boolean | null;
};

export type FrontDeskRejectMutationVariables = {
  frontDeskRejectId: string;
  reason: string;
};

export const FRONT_DESK_REJECT_MUTATION = gql`
  mutation FrontDeskReject($frontDeskRejectId: ID!, $reason: String!) {
    frontDeskReject(id: $frontDeskRejectId, reason: $reason)
  }
`;
