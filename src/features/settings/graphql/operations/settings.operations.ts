import { apolloClient } from "@/lib/apollo/client";

import {
  CHANGE_MY_PASSWORD_MUTATION,
  type ChangeMyPasswordMutationData,
} from "../mutations/change-my-password";
import {
  STAFF_UPDATE_PROFILE_MUTATION,
  type StaffProfileInput,
  type StaffUpdateProfileMutationData,
  type StaffUpdateProfileResult,
} from "../mutations/staff-update-profile";

export async function staffUpdateProfileOperation(
  profile: StaffProfileInput,
): Promise<StaffUpdateProfileResult> {
  const { data } = await apolloClient.mutate<StaffUpdateProfileMutationData>({
    mutation: STAFF_UPDATE_PROFILE_MUTATION,
    variables: { profile },
  });

  if (!data?.staffUpdateProfile?.id) {
    throw new Error("Failed to update profile.");
  }

  return data.staffUpdateProfile;
}

export async function changeMyPasswordOperation(
  oldPassword: string,
  newPassword: string,
): Promise<boolean> {
  const { data } = await apolloClient.mutate<ChangeMyPasswordMutationData>({
    mutation: CHANGE_MY_PASSWORD_MUTATION,
    variables: { oldPassword, newPassword },
  });

  return Boolean(data?.changeMyPassword);
}
