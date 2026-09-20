import { gql } from "@apollo/client";

export type FrontDeskApproveMutationData = {
  frontDeskApprove: boolean | null;
};

export type FrontDeskApproveMutationVariables = {
  frontDeskApproveId: string;
};

export const FRONT_DESK_APPROVE_MUTATION = gql`
  mutation FrontDeskApprove($frontDeskApproveId: ID!) {
    frontDeskApprove(id: $frontDeskApproveId)
  }
`;
