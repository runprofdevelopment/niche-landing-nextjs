import { gql } from "@apollo/client";

export type RoleEmployeeRef = {
  id: string;
  fullName: string | null;
};

export type RoleFindNode = {
  id: string;
  name: string;
  description: string | null;
  status: string | null;
  permissionKeys: string[] | null;
  permissionsCount: number | null;
  assignedUsersCount: number | null;
  createdAt: string | null;
  createdBy: string | null;
  updatedAt: string | null;
  createByEmployee: RoleEmployeeRef | null;
  updateByEmployee: RoleEmployeeRef | null;
};

export type RoleFindQueryData = {
  roleFind: RoleFindNode | null;
};

export type RoleFindQueryVariables = {
  roleFindId: string;
};

export const ROLE_FIND_QUERY = gql`
  query RoleFind($roleFindId: ID!) {
    roleFind(id: $roleFindId) {
      id
      description
      createdBy
      createdAt
      assignedUsersCount
      name
      permissionsCount
      permissionKeys
      status
      updateByEmployee {
        fullName
        id
      }
      createByEmployee {
        id
        fullName
      }
      updatedAt
    }
  }
`;
