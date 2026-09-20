import { gql } from "@apollo/client";

export type UpdateRoleInput = {
  name?: string | null;
  description?: string | null;
  permissionKeys?: string[] | null;
};

export type RoleUpdateMutationData = {
  roleUpdate: {
    id: string;
    name: string;
  } | null;
};

export type RoleUpdateMutationVariables = {
  roleUpdateId: string;
  data: UpdateRoleInput;
};

export const ROLE_UPDATE_MUTATION = gql`
  mutation RoleUpdate($roleUpdateId: ID!, $data: UpdateRoleInput!) {
    roleUpdate(id: $roleUpdateId, data: $data) {
      id
      name
    }
  }
`;
