import { gql } from "@apollo/client";

export type RoleDestroyMutationData = {
  roleDestroy: {
    id: string;
    name: string;
  } | null;
};

export type RoleDestroyMutationVariables = {
  roleDestroyId: string;
};

export const ROLE_DESTROY_MUTATION = gql`
  mutation RoleDestroy($roleDestroyId: ID!) {
    roleDestroy(id: $roleDestroyId) {
      id
      name
    }
  }
`;
