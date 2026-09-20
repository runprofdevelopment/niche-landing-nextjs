import { gql } from "@apollo/client";

/** Backend `GenericStatusEnum` values used by `setUserStatus`. */
export type GenericStatus = "active" | "inactive";

export type SetUserStatusMutationData = {
  setUserStatus: boolean | string | null;
};

export type SetUserStatusMutationVariables = {
  setUserStatusId: string;
  status: GenericStatus;
};

export const SET_USER_STATUS_MUTATION = gql`
  mutation SetUserStatus($setUserStatusId: ID!, $status: GenericStatusEnum!) {
    setUserStatus(id: $setUserStatusId, status: $status)
  }
`;
