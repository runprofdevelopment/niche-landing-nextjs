/**
 * Auth GraphQL operations — talk to the backend (or mock) instead of embedding API in UI.
 */

import { apolloClient } from "@/lib/apollo/client";

import { mapAuthMeFromApi } from "../mappers/user.mapper";
import {
  PASSWORD_RESET_MUTATION,
  RESEND_VERIFICATION_CODE_MUTATION,
  VERIFY_EMAIL_MUTATION,
  type PasswordResetMutationData,
  type ResendVerificationCodeMutationData,
  type VerifyEmailMutationData,
} from "../mutations/auth-email";
import {
  ADD_DEVICE_TOKEN_MUTATION,
  REMOVE_DEVICE_TOKEN_MUTATION,
  type AddDeviceTokenMutationData,
  type RemoveDeviceTokenMutationData,
} from "../mutations/device-token";
import {
  STAFF_REGISTER_MUTATION,
  type StaffRegisterInput,
  type StaffRegisterMutationData,
  type StaffRegisterResult,
} from "../mutations/staff-register";
import { AUTH_ME_QUERY, type AuthMeQueryData } from "../queries/auth-me";

import type { MeProfile, RegisterUserInput } from "../../types";

export async function fetchMeOperation(): Promise<MeProfile | null> {
  const { data } = await apolloClient.query<AuthMeQueryData>({
    query: AUTH_ME_QUERY,
    fetchPolicy: "network-only",
  });
  const me = data?.authMe;
  return me ? mapAuthMeFromApi(me) : null;
}

export async function staffRegisterOperation(
  input: RegisterUserInput,
): Promise<StaffRegisterResult> {
  const dataInput: StaffRegisterInput = {
    countryCode: input.countryCode,
    department: input.department,
    email: input.email,
    fullName: input.fullName,
    phoneNumber: input.phoneNumber,
  };

  const { data } = await apolloClient.mutate<StaffRegisterMutationData>({
    mutation: STAFF_REGISTER_MUTATION,
    variables: { data: dataInput },
  });

  if (!data?.staffRegister?.id) {
    throw new Error("Staff registration failed.");
  }

  return data.staffRegister;
}

export async function passwordResetOperation(email: string): Promise<boolean> {
  const { data } = await apolloClient.mutate<PasswordResetMutationData>({
    mutation: PASSWORD_RESET_MUTATION,
    variables: { email },
  });
  return Boolean(data?.passwordReset);
}

export async function verifyEmailOperation(code: string): Promise<boolean> {
  const { data } = await apolloClient.mutate<VerifyEmailMutationData>({
    mutation: VERIFY_EMAIL_MUTATION,
    variables: { code },
  });
  return Boolean(data?.verifyEmail);
}

export async function resendVerificationCodeOperation(): Promise<boolean> {
  const { data } = await apolloClient.mutate<ResendVerificationCodeMutationData>({
    mutation: RESEND_VERIFICATION_CODE_MUTATION,
  });
  return Boolean(data?.resendVerificationCode);
}

export async function addDeviceTokenOperation(token: string): Promise<boolean> {
  const { data } = await apolloClient.mutate<AddDeviceTokenMutationData>({
    mutation: ADD_DEVICE_TOKEN_MUTATION,
    variables: { token },
  });
  return Boolean(data?.addDeviceToken);
}

export async function removeDeviceTokenOperation(token: string): Promise<boolean> {
  const { data } = await apolloClient.mutate<RemoveDeviceTokenMutationData>({
    mutation: REMOVE_DEVICE_TOKEN_MUTATION,
    variables: { token },
  });
  return Boolean(data?.removeDeviceToken);
}
