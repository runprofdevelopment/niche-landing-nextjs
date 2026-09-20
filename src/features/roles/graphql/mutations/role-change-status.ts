import { gql } from "@apollo/client";

import type { RoleStatusEnum } from "../queries/role-list";

export type RoleChangeStatusMutationData = {
  roleChangeStatus: {
    id: string;
    name: string;
  } | null;
};

export type RoleChangeStatusMutationVariables = {
  roleChangeStatusId: string;
  status: RoleStatusEnum;
};

export const ROLE_CHANGE_STATUS_MUTATION = gql`
  mutation RoleChangeStatus($roleChangeStatusId: ID!, $status: GenericStatusEnum!) {
    roleChangeStatus(id: $roleChangeStatusId, status: $status) {
      id
      name
    }
  }
`;
