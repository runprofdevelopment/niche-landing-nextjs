import { gql } from "@apollo/client";

export type ChangeMyPasswordMutationData = {
  changeMyPassword: boolean;
};

export const CHANGE_MY_PASSWORD_MUTATION = gql`
  mutation ChangeMyPassword($oldPassword: String!, $newPassword: String!) {
    changeMyPassword(oldPassword: $oldPassword, newPassword: $newPassword)
  }
`;
