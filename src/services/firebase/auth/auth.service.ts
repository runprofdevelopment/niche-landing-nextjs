import {
  getAuth,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signOut,
  type Auth,
  type ConfirmationResult,
  type Unsubscribe,
  type User,
} from "firebase/auth";

import { toE164Phone } from "@/shared/utils";

import { getFirebaseApp } from "../app";

import { mapFirebaseAuthError } from "./auth.errors";

import type { AuthSession, LoginCredentials } from "./auth.types";

let authInstance: Auth | undefined;
let phoneRecaptchaVerifier: RecaptchaVerifier | undefined;
let phoneConfirmationResult: ConfirmationResult | undefined;
let phoneAuthDevModeConfigured = false;

/** DOM id for the invisible reCAPTCHA container on the phone-verify page. */
export const FIREBASE_RECAPTCHA_CONTAINER_ID = "firebase-phone-recaptcha";

/**
 * In development, skip real reCAPTCHA app verification so Firebase test phone
 * numbers work locally. Requires fictional numbers in Firebase Console →
 * Authentication → Phone → Phone numbers for testing.
 *
 * @see https://firebase.google.com/docs/auth/web/phone-auth#test-with-fictional-phone-numbers
 */
function configurePhoneAuthForDevelopment(): void {
  if (phoneAuthDevModeConfigured || process.env.NODE_ENV !== "development") {
    return;
  }

  getFirebaseAuth().settings.appVerificationDisabledForTesting = true;
  phoneAuthDevModeConfigured = true;
}

/**
 * Returns the singleton Firebase Auth instance.
 *
 * Lazily initialized on first access to keep bundle size small until auth is needed.
 */
export function getFirebaseAuth(): Auth {
  authInstance ??= getAuth(getFirebaseApp());
  return authInstance;
}

/**
 * Returns the currently signed-in user, if any.
 *
 * Infrastructure only — session subscription lives in `providers/auth/`.
 */
export function getCurrentUser(): User | null {
  return getFirebaseAuth().currentUser;
}

async function toAuthSession(user: User, forceRefresh = false): Promise<AuthSession> {
  const tokenResult = await user.getIdTokenResult(forceRefresh);
  return {
    user,
    idToken: tokenResult.token,
    expiresAt: Date.parse(tokenResult.expirationTime),
  };
}

/**
 * Signs in with email and password.
 */
export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  try {
    const { user } = await signInWithEmailAndPassword(
      getFirebaseAuth(),
      credentials.email.trim(),
      credentials.password,
    );
    return await toAuthSession(user);
  } catch (error) {
    throw mapFirebaseAuthError(error);
  }
}

/**
 * Signs out the current user.
 */
export async function logout(): Promise<void> {
  try {
    await signOut(getFirebaseAuth());
  } catch (error) {
    throw mapFirebaseAuthError(error);
  }
}

/**
 * Force-refreshes the ID token for the current session.
 *
 * Prefer the soft refresh inside `getIdToken()` (auth-link) for normal requests.
 * Use this after custom-claims changes or when the server rejects a stale token.
 */
export async function refreshSession(): Promise<AuthSession> {
  const user = getCurrentUser();
  if (!user) {
    throw mapFirebaseAuthError({ code: "auth/session-expired", message: "No active session." });
  }

  try {
    return await toAuthSession(user, true);
  } catch (error) {
    throw mapFirebaseAuthError(error);
  }
}

/**
 * Clears the in-memory phone verification session (reCAPTCHA + SMS confirmation).
 */
export function clearPhoneVerificationSession(): void {
  if (phoneRecaptchaVerifier) {
    phoneRecaptchaVerifier.clear();
  }
  phoneRecaptchaVerifier = undefined;
  phoneConfirmationResult = undefined;
}

async function ensurePhoneRecaptchaVerifier(): Promise<RecaptchaVerifier> {
  if (phoneRecaptchaVerifier) {
    return phoneRecaptchaVerifier;
  }

  if (typeof document === "undefined") {
    throw mapFirebaseAuthError({
      code: "auth/internal-error",
      message: "reCAPTCHA requires a browser environment.",
    });
  }

  if (!document.getElementById(FIREBASE_RECAPTCHA_CONTAINER_ID)) {
    throw mapFirebaseAuthError({
      code: "auth/internal-error",
      message: "reCAPTCHA container is not mounted.",
    });
  }

  configurePhoneAuthForDevelopment();

  phoneRecaptchaVerifier = new RecaptchaVerifier(
    getFirebaseAuth(),
    FIREBASE_RECAPTCHA_CONTAINER_ID,
    { size: "invisible" },
  );

  await phoneRecaptchaVerifier.render();

  return phoneRecaptchaVerifier;
}

/**
 * Sends an SMS verification code via Firebase Phone Auth.
 *
 * Requires an invisible reCAPTCHA container (`FIREBASE_RECAPTCHA_CONTAINER_ID`) in the DOM.
 */
export async function sendPhoneVerificationCode(phoneNumber: string): Promise<void> {
  clearPhoneVerificationSession();

  const e164 = toE164Phone(undefined, phoneNumber);
  if (!e164) {
    throw mapFirebaseAuthError({
      code: "auth/invalid-phone-number",
      message: "Invalid phone number format.",
    });
  }

  try {
    const verifier = await ensurePhoneRecaptchaVerifier();
    phoneConfirmationResult = await signInWithPhoneNumber(getFirebaseAuth(), e164, verifier);
  } catch (error) {
    clearPhoneVerificationSession();
    throw mapFirebaseAuthError(error);
  }
}

/**
 * Confirms the SMS code and establishes a Firebase session (same as login).
 *
 * After this resolves, Apollo's auth link will attach `Authorization: Bearer <token>`
 * on subsequent GraphQL requests, with automatic token refresh via `getIdToken()`.
 */
export async function confirmPhoneVerificationCode(otp: string): Promise<AuthSession> {
  if (!phoneConfirmationResult) {
    throw mapFirebaseAuthError({
      code: "auth/session-expired",
      message: "SMS verification was not started. Request a new code.",
    });
  }

  try {
    const { user } = await phoneConfirmationResult.confirm(otp);
    return await toAuthSession(user);
  } catch (error) {
    throw mapFirebaseAuthError(error);
  }
}

/**
 * Subscribes to Firebase auth state changes.
 *
 * Used by `AuthProvider` — prefer that over calling this from features.
 */
export function subscribeToAuthState(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(getFirebaseAuth(), callback);
}

/**
 * Resets the cached Auth instance — useful in tests.
 */
export function resetFirebaseAuthCache(): void {
  authInstance = undefined;
}
