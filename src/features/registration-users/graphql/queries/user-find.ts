import { gql } from "@apollo/client";

import type { GuestUserNode } from "./guest-list";

export type GuestUserFindQueryData = {
  userFind: GuestUserNode | null;
};

export type GuestUserFindQueryVariables = {
  userFindId: string;
};

export const GUEST_USER_FIND_QUERY = gql`
  query UserFind($userFindId: ID!) {
    userFind(id: $userFindId) {
      id
      email
      fullName
      guestType
      emailVerified
      isOwner
      phoneNumber
      status
      updatedAt
      createdAt
      countryCode
      formattedPhoneNumber
      profileType
      avatar {
        id
        publicUrl
        name
      }
      updatedByUser {
        id
        fullName
      }
    }
  }
`;
