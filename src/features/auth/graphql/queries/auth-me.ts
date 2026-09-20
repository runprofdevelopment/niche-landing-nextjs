import { gql } from "@apollo/client";

import type { AuthProfileType } from "../../types";

export type AuthMeAvatarNode = {
  id: string;
  name?: string | null;
  publicUrl?: string | null;
};

export type AuthMeBaseNode = {
  __typename?: "StaffProfile" | "GuestProfile" | "FrontdeskProfile" | string;
  id: string;
  email: string;
  emailVerified: boolean;
  fullName?: string | null;
  countryCode?: string | null;
  formattedPhoneNumber?: string | null;
  phoneNumber?: string | null;
  photoURL?: string | null;
  profileType: AuthProfileType;
  status?: string | null;
  provider?: string | null;
  internalId?: string | null;
  avatar?: AuthMeAvatarNode | null;
  isOwner?: boolean | null;
  permissions?: string[] | null;
  roles?: string[] | null;
  roleIds?: string[] | null;
};

export type AuthMeQueryData = {
  authMe: AuthMeBaseNode | null;
};

/** Matches backend `authMe` — kept local while full schema codegen is incomplete. */
export const AUTH_ME_QUERY = gql`
  query AuthMe {
    authMe {
      id
      email
      emailVerified
      fullName
      countryCode
      formattedPhoneNumber
      phoneNumber
      photoURL
      profileType
      status
      provider
      internalId
      avatar {
        id
        name
        publicUrl
      }
      ... on StaffProfile {
        isOwner
        permissions
        roles
        roleIds
      }
      ... on FrontdeskProfile {
        id
        fullName
        status
      }
    }
  }
`;
