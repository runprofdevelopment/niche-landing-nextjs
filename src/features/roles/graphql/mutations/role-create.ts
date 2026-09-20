import { gql } from "@apollo/client";

import type { RoleStatusEnum } from "../queries/role-list";

export type CreateRoleInput = {
  name: string;
  description?: string | null;
  permissionKeys: string[];
  status: RoleStatusEnum;
};

export type RoleCreateMutationData = {
  roleCreate: {
    id: string;
    name: string;
  } | null;
};

export type RoleCreateMutationVariables = {
  data: CreateRoleInput;
};

export const ROLE_CREATE_MUTATION = gql`
  mutation RoleCreate($data: CreateRoleInput!) {
    roleCreate(data: $data) {
      id
      name
    }
  }
`;
