import { gql } from "@apollo/client";

import type { StaffUserNode } from "./user-list";

export type StaffUserFindQueryData = {
  userFind: StaffUserNode | null;
};

export type StaffUserFindQueryVariables = {
  userFindId: string;
};

export const STAFF_USER_FIND_QUERY = gql`
  query UserFind($userFindId: ID!) {
    userFind(id: $userFindId) {
      avatar {
        id
        name
        publicUrl
      }
      id
      email
      emailVerified
      disabled
      createdByUser {
        id
        fullName
      }
      countryCode
      displayRolesNames
      formattedPhoneNumber
      phoneNumber
      permissions
      rejectReason
      roles
      roleIds
      isOwner
      status
      updatedAt
      updatedByUser {
        id
        fullName
      }
      createdAt
      fullName
      profileType
    }
  }
`;
