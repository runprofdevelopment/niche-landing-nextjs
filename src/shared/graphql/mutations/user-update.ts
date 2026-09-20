import { gql } from "@apollo/client";

export type UserAvatarInput = {
  id?: string | null;
  name?: string | null;
  new?: boolean | null;
  privateUrl?: string | null;
  publicUrl?: string | null;
  sizeInBytes?: number | null;
};

export type UpdateUserInput = {
  countryCode?: string | null;
  email?: string | null;
  fullName?: string | null;
  phoneNumber?: string | null;
  roleIds?: string[] | null;
  avatar?: UserAvatarInput | null;
};

export type UserUpdateResult = {
  email: string | null;
  fullName: string | null;
};

export type UserUpdateMutationData = {
  userUpdate: UserUpdateResult;
};

export type UserUpdateMutationVariables = {
  userUpdateId: string;
  data: UpdateUserInput;
};

export const USER_UPDATE_MUTATION = gql`
  mutation UserUpdate($userUpdateId: ID!, $data: UpdateUserInput!) {
    userUpdate(id: $userUpdateId, data: $data) {
      email
      fullName
    }
  }
`;
