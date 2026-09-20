import { gql } from "@apollo/client";

export type StaffAvatarInput = {
  id?: string | null;
  name?: string | null;
  new?: boolean | null;
  privateUrl?: string | null;
  publicUrl?: string | null;
  sizeInBytes?: number | null;
};

export type StaffProfileInput = {
  avatar?: StaffAvatarInput | null;
  countryCode: string;
  fullName: string;
  phoneNumber: string;
};

export type StaffUpdateProfileResult = {
  email: string;
  id: string;
  fullName: string | null;
};

export type StaffUpdateProfileMutationData = {
  staffUpdateProfile: StaffUpdateProfileResult;
};

export const STAFF_UPDATE_PROFILE_MUTATION = gql`
  mutation StaffUpdateProfile($profile: StaffProfileInput!) {
    staffUpdateProfile(profile: $profile) {
      email
      id
      fullName
    }
  }
`;
