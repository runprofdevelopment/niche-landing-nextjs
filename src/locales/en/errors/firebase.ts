/**
 * User-facing English messages for Firebase error codes.
 *
 * Keys mirror the raw Firebase `code` (e.g. `auth/wrong-password`). The
 * `default` entry is used when a code is not listed here.
 */
const firebase = {
  "auth/wrong-password": "The password you entered is incorrect. Please try again.",
  "auth/invalid-credential": "These credentials do not match our records.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/user-not-found": "No account matches this email.",
  "auth/missing-password": "Please enter your password.",
  "auth/email-already-in-use": "This email is already registered.",
  "auth/requires-recent-login": "Please sign in again to continue.",
  "auth/session-expired": "Your session has expired. Please sign in again.",
  "auth/invalid-verification-code": "The verification code is invalid.",
  "auth/invalid-verification-id": "The verification link is invalid or has expired.",
  "auth/account-exists-with-different-credential":
    "An account with this email already exists using a different sign-in method.",
  "auth/weak-password": "Please choose a stronger password (min 8 characters).",
  "auth/too-many-requests": "Too many attempts. Please wait a minute and try again.",
  "auth/user-disabled": "This account has been disabled. Contact support for help.",
  "auth/operation-not-allowed": "This sign-in method is not enabled.",
  "auth/admin-restricted-operation": "This action is restricted to administrators.",
  "auth/unauthorized-domain": "This domain is not authorized for sign-in.",
  "auth/network-request-failed": "Network problem. Check your connection and try again.",
  "auth/timeout": "The request timed out. Please try again.",
  "auth/internal-error": "Something went wrong on our end. Please try again in a moment.",
  "auth/captcha-check-failed": "Security verification failed. Please try again.",
  "auth/invalid-app-credential": "Phone sign-in is not configured correctly. Contact support.",
  "storage/unauthenticated": "Please sign in to continue.",
  "storage/unauthorized": "You do not have permission to access this file.",
  "storage/retry-limit-exceeded": "Upload failed after several attempts. Please try again.",
  "storage/canceled": "Upload was canceled.",
  "storage/object-not-found": "The requested file could not be found.",
  "storage/unknown":
    "Something went wrong while accessing storage. Please check your connection and try again.",
  "firestore/permission-denied": "You do not have permission to perform this action.",
  "firestore/failed-precondition":
    "Chat could not load because a Firestore index or rule is missing. Check the browser console for details.",
  "firestore/not-found": "The Firestore database or collection could not be found.",
  "firestore/cancelled": "The chat request was cancelled.",
  "firestore/unavailable": "The service is temporarily unavailable. Please try again.",
  "firestore/deadline-exceeded": "The request took too long. Please try again.",
  "functions/deadline-exceeded": "The request took too long. Please try again.",
  "functions/unavailable": "The service is temporarily unavailable. Please try again.",
  default: "Something went wrong. Please try again.",
} as const;

export default firebase;
