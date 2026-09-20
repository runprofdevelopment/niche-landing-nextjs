import { gql } from "@apollo/client";

export type UserDestroyResult = {
  id: string;
  fullName: string | null;
  email?: string | null;
};

export type UserDestroyMutationData = {
  userDestroy: UserDestroyResult;
};

export type UserDestroyMutationVariables = {
  userDestroyId: string;
};

export const USER_DESTROY_MUTATION = gql`
  mutation UserDestroy($userDestroyId: ID!) {
    userDestroy(id: $userDestroyId) {
      id
      fullName
    }
  }
`;
