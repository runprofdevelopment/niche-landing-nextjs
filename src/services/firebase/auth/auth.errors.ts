import { FirebaseServiceError } from "../utils";

/**
 * Known Firebase Authentication error codes.
 *
 * Extend as authentication flows are implemented.
 * @see https://firebase.google.com/docs/auth/admin/errors
 */
export const firebaseAuthErrorCodes = {
  invalidEmail: "auth/invalid-email",
  invalidCredential: "auth/invalid-credential",
  userDisabled: "auth/user-disabled",
  userNotFound: "auth/user-not-found",
  wrongPassword: "auth/wrong-password",
  emailAlreadyInUse: "auth/email-already-in-use",
  weakPassword: "auth/weak-password",
  tooManyRequests: "auth/too-many-requests",
  networkRequestFailed: "auth/network-request-failed",
  internalError: "auth/internal-error",
  sessionExpired: "auth/session-expired",
  notImplemented: "auth/not-implemented",
} as const;

export type FirebaseAuthErrorCode =
  (typeof firebaseAuthErrorCodes)[keyof typeof firebaseAuthErrorCodes];

const authErrorMessages: Record<string, string> = {
  [firebaseAuthErrorCodes.invalidEmail]: "The email address is invalid.",
  [firebaseAuthErrorCodes.invalidCredential]: "These credentials do not match our records.",
  [firebaseAuthErrorCodes.userDisabled]: "This account has been disabled.",
  [firebaseAuthErrorCodes.userNotFound]: "No account found with this email.",
  [firebaseAuthErrorCodes.wrongPassword]: "Incorrect password.",
  [firebaseAuthErrorCodes.emailAlreadyInUse]: "This email is already registered.",
  [firebaseAuthErrorCodes.weakPassword]: "Password is too weak.",
  [firebaseAuthErrorCodes.tooManyRequests]: "Too many attempts. Try again later.",
  [firebaseAuthErrorCodes.networkRequestFailed]: "Network error. Check your connection.",
  [firebaseAuthErrorCodes.internalError]: "Something went wrong. Please try again.",
  [firebaseAuthErrorCodes.sessionExpired]: "Your session has expired. Please sign in again.",
  [firebaseAuthErrorCodes.notImplemented]: "Authentication flow is not implemented yet.",
};

/**
 * Maps a Firebase Auth SDK error code to a user-facing message.
 *
 * The global error handler can use this for toast copy without importing Firebase in UI.
 */
export function getFirebaseAuthErrorMessage(code: string): string {
  return authErrorMessages[code] ?? "An authentication error occurred.";
}

/**
 * Maps a raw Firebase Auth error into a normalized `FirebaseServiceError`.
 */
export function mapFirebaseAuthError(error: unknown): FirebaseServiceError {
  if (error instanceof FirebaseServiceError) {
    return error;
  }

  const code =
    typeof error === "object" && error !== null && "code" in error && typeof error.code === "string"
      ? error.code
      : firebaseAuthErrorCodes.notImplemented;

  return new FirebaseServiceError(getFirebaseAuthErrorMessage(code), {
    code,
    service: "auth",
    cause: error,
  });
}

/**
 * Thrown when an auth method is called before its flow is implemented.
 */
export class FirebaseAuthNotImplementedError extends FirebaseServiceError {
  constructor(method: string) {
    super(getFirebaseAuthErrorMessage(firebaseAuthErrorCodes.notImplemented), {
      code: firebaseAuthErrorCodes.notImplemented,
      service: "auth",
    });
    this.name = "FirebaseAuthNotImplementedError";
    this.message = `${method} is not implemented yet.`;
  }
}
