import {
  fetchMeOperation,
  passwordResetOperation,
  resendVerificationCodeOperation,
  staffRegisterOperation,
  verifyEmailOperation,
} from "@/features/auth/graphql";
import { getDialCode } from "@/shared/utils/international-phone";

import type { MeProfile, RegisterUserInput } from "../types";

export type { MeProfile, RegisterUserInput } from "../types";

/**
 * Registers the Firebase user as staff on the backend.
 * Caller must already be signed in so Apollo can attach the Bearer token.
 */
export async function registerUserWithBackend(
  input: RegisterUserInput,
  _idToken: string,
): Promise<{ id: string; fullName: string | null }> {
  const result = await staffRegisterOperation({
    ...input,
    // Backend expects dial code (e.g. +966), form stores ISO country (e.g. SA).
    countryCode: input.countryCode.startsWith("+")
      ? input.countryCode
      : getDialCode(input.countryCode),
  });
  return { id: result.id, fullName: result.fullName };
}

export async function fetchMeProfile(_idToken: string): Promise<MeProfile | null> {
  try {
    return await fetchMeOperation();
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[auth] fetchMeProfile — backend not ready or query failed", error);
    }
    return null;
  }
}

export async function requestPasswordReset(email: string): Promise<boolean> {
  return passwordResetOperation(email.trim());
}

export async function verifyEmailWithCode(code: string): Promise<boolean> {
  return verifyEmailOperation(code.trim());
}

export async function resendVerificationCode(): Promise<boolean> {
  return resendVerificationCodeOperation();
}
