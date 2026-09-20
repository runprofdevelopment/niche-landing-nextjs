import { FirebaseServiceError } from "../utils";

/**
 * Known Firebase Storage error codes.
 */
export const firebaseStorageErrorCodes = {
  objectNotFound: "storage/object-not-found",
  unauthorized: "storage/unauthorized",
  canceled: "storage/canceled",
  unknown: "storage/unknown",
  notImplemented: "storage/not-implemented",
} as const;

export type FirebaseStorageErrorCode =
  (typeof firebaseStorageErrorCodes)[keyof typeof firebaseStorageErrorCodes];

const storageErrorMessages: Record<string, string> = {
  [firebaseStorageErrorCodes.objectNotFound]: "File not found.",
  [firebaseStorageErrorCodes.unauthorized]: "You do not have permission to access this file.",
  [firebaseStorageErrorCodes.canceled]: "Upload was canceled.",
  [firebaseStorageErrorCodes.unknown]: "A storage error occurred.",
  [firebaseStorageErrorCodes.notImplemented]: "Storage operation is not implemented yet.",
};

export function getFirebaseStorageErrorMessage(code: string): string {
  return storageErrorMessages[code] ?? "A storage error occurred.";
}

export function mapFirebaseStorageError(error: unknown): FirebaseServiceError {
  if (error instanceof FirebaseServiceError) {
    return error;
  }

  const code =
    typeof error === "object" && error !== null && "code" in error && typeof error.code === "string"
      ? error.code
      : firebaseStorageErrorCodes.unknown;

  return new FirebaseServiceError(getFirebaseStorageErrorMessage(code), {
    code,
    service: "storage",
    cause: error,
  });
}

export class FirebaseStorageNotImplementedError extends FirebaseServiceError {
  constructor(operation: string) {
    super(getFirebaseStorageErrorMessage(firebaseStorageErrorCodes.notImplemented), {
      code: firebaseStorageErrorCodes.notImplemented,
      service: "storage",
    });
    this.name = "FirebaseStorageNotImplementedError";
    this.message = `${operation} is not implemented yet.`;
  }
}
