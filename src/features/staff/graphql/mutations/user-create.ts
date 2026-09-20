import { gql } from "@apollo/client";

import type { UserAvatarInput } from "@/shared/graphql/mutations/user-update";

export type CreateStaffUserInput = {
  email: string;
  fullName: string;
  phoneNumber: string;
  countryCode: string;
  roleIds: string[];
  avatar?: UserAvatarInput | null;
};

export type StaffUserCreateMutationData = {
  userCreate: {
    id: string;
    fullName: string | null;
  } | null;
};

export type StaffUserCreateMutationVariables = {
  data: CreateStaffUserInput;
};

export const STAFF_USER_CREATE_MUTATION = gql`
  mutation UserCreate($data: CreateUserInput!) {
    userCreate(data: $data) {
      id
      fullName
    }
  }
`;
