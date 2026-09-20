import { gql } from "@apollo/client";

export type UserAssignRoleResult = {
  id: string;
  fullName: string | null;
};

export type UserAssignRoleMutationData = {
  userAssignRole: UserAssignRoleResult;
};

export type UserAssignRoleMutationVariables = {
  userAssignRoleId: string;
  roleIds: string[];
};

export const USER_ASSIGN_ROLE_MUTATION = gql`
  mutation UserAssignRole($userAssignRoleId: ID!, $roleIds: [String!]!) {
    userAssignRole(id: $userAssignRoleId, roleIds: $roleIds) {
      id
      fullName
    }
  }
`;
