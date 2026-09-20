import type { ErrorKind, ErrorSeverity } from "./types";

/**
 * Minimal Firebase error shape.
 *
 * Duck-typed on purpose — this module never imports `firebase/*`. Any object
 * exposing a `<product>/<slug>` code string is considered a Firebase error.
 */
export type FirebaseErrorShape = {
  code: string;
  message?: string;
};

const FIREBASE_PRODUCT_PREFIXES = new Set([
  "app",
  "auth",
  "storage",
  "firestore",
  "functions",
  "messaging",
  "analytics",
  "installations",
  "performance",
  "remote-config",
  "app-check",
  "database",
  "data-connect",
]);

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Type guard for Firebase-shaped errors. */
export function isFirebaseError(error: unknown): error is FirebaseErrorShape {
  if (!isPlainRecord(error)) return false;
  const code = error["code"];
  if (typeof code !== "string" || code.length === 0) return false;
  const slash = code.indexOf("/");
  if (slash <= 0) return false;
  return FIREBASE_PRODUCT_PREFIXES.has(code.slice(0, slash));
}

/**
 * Firebase code → { kind, severity } map.
 *
 * Anything not listed defaults to `{ kind: 'unknown', severity: 'error' }`.
 * The message key is derived deterministically as `firebase.<code>` with a
 * fallback of `firebase.default` and finally `generic.<kind>`.
 */
export const FIREBASE_CODE_MAP: Record<string, { kind: ErrorKind; severity: ErrorSeverity }> = {
  // Auth — credentials / identity
  "auth/wrong-password": { kind: "auth", severity: "warning" },
  "auth/invalid-credential": { kind: "auth", severity: "warning" },
  "auth/invalid-email": { kind: "auth", severity: "warning" },
  "auth/user-not-found": { kind: "auth", severity: "warning" },
  "auth/missing-password": { kind: "auth", severity: "warning" },
  "auth/email-already-in-use": { kind: "auth", severity: "warning" },
  "auth/requires-recent-login": { kind: "auth", severity: "warning" },
  "auth/session-expired": { kind: "auth", severity: "warning" },
  "auth/invalid-verification-code": { kind: "auth", severity: "warning" },
  "auth/invalid-verification-id": { kind: "auth", severity: "warning" },
  "auth/account-exists-with-different-credential": {
    kind: "auth",
    severity: "warning",
  },

  // Auth — validation
  "auth/weak-password": { kind: "validation", severity: "warning" },

  // Auth — rate limits
  "auth/too-many-requests": { kind: "auth", severity: "error" },

  // Auth — permission / disabled
  "auth/user-disabled": { kind: "permission", severity: "error" },
  "auth/operation-not-allowed": { kind: "permission", severity: "error" },
  "auth/admin-restricted-operation": { kind: "permission", severity: "error" },
  "auth/unauthorized-domain": { kind: "permission", severity: "error" },

  // Auth — network / server
  "auth/network-request-failed": { kind: "network", severity: "error" },
  "auth/timeout": { kind: "network", severity: "error" },
  "auth/internal-error": { kind: "unknown", severity: "error" },
  "auth/captcha-check-failed": { kind: "auth", severity: "warning" },
  "auth/invalid-app-credential": { kind: "auth", severity: "error" },

  // Storage
  "storage/unauthenticated": { kind: "auth", severity: "warning" },
  "storage/unauthorized": { kind: "permission", severity: "error" },
  "storage/retry-limit-exceeded": { kind: "network", severity: "error" },
  "storage/canceled": { kind: "unknown", severity: "warning" },
  "storage/object-not-found": { kind: "unknown", severity: "warning" },
  "storage/unknown": { kind: "unknown", severity: "error" },

  // Firestore
  "firestore/permission-denied": { kind: "permission", severity: "error" },
  "firestore/failed-precondition": { kind: "api", severity: "error" },
  "firestore/not-found": { kind: "unknown", severity: "error" },
  "firestore/cancelled": { kind: "unknown", severity: "warning" },
  "firestore/unavailable": { kind: "network", severity: "error" },
  "firestore/deadline-exceeded": { kind: "network", severity: "error" },

  // Functions
  "functions/deadline-exceeded": { kind: "network", severity: "error" },
  "functions/unavailable": { kind: "network", severity: "error" },
};
