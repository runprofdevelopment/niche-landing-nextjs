/**
 * Shared Firebase error types and mapping utilities.
 *
 * Services throw mapped errors — they never swallow Firebase SDK failures.
 * Global error handling (toasts, Sentry) integrates at the provider / error-handler layer.
 */

export type FirebaseErrorCode = string;

export type FirebaseServiceErrorOptions = {
  code: FirebaseErrorCode;
  service: "auth" | "storage" | "app";
  cause?: unknown;
};

/**
 * Normalized Firebase service error for application-wide handling.
 */
export class FirebaseServiceError extends Error {
  readonly code: FirebaseErrorCode;

  readonly service: FirebaseServiceErrorOptions["service"];

  override readonly cause?: unknown;

  constructor(message: string, options: FirebaseServiceErrorOptions) {
    super(message);
    this.name = "FirebaseServiceError";
    this.code = options.code;
    this.service = options.service;
    this.cause = options.cause;
  }
}

type FirebaseErrorLike = {
  code?: string;
  message?: string;
};

export function isFirebaseErrorLike(error: unknown): error is FirebaseErrorLike {
  return typeof error === "object" && error !== null && ("code" in error || "message" in error);
}

/**
 * Maps a raw Firebase SDK error into a `FirebaseServiceError`.
 *
 * Preserves the original error as `cause` for logging and Sentry breadcrumbs.
 */
export function mapFirebaseError(
  error: unknown,
  service: FirebaseServiceErrorOptions["service"],
  fallbackMessage: string,
): FirebaseServiceError {
  if (error instanceof FirebaseServiceError) {
    return error;
  }

  const code = isFirebaseErrorLike(error) && error.code ? error.code : "unknown";
  const message = isFirebaseErrorLike(error) && error.message ? error.message : fallbackMessage;

  return new FirebaseServiceError(message, {
    code,
    service,
    cause: error,
  });
}

/**
 * Re-throws mapped Firebase errors. Use in service `catch` blocks.
 */
export function throwMappedFirebaseError(
  error: unknown,
  service: FirebaseServiceErrorOptions["service"],
  fallbackMessage: string,
): never {
  throw mapFirebaseError(error, service, fallbackMessage);
}
