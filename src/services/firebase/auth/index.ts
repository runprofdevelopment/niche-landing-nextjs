/**
 * Firebase Authentication service.
 */

export {
  clearPhoneVerificationSession,
  confirmPhoneVerificationCode,
  FIREBASE_RECAPTCHA_CONTAINER_ID,
  getCurrentUser,
  getFirebaseAuth,
  login,
  logout,
  refreshSession,
  resetFirebaseAuthCache,
  sendPhoneVerificationCode,
  subscribeToAuthState,
} from "./auth.service";
export {
  FirebaseAuthNotImplementedError,
  firebaseAuthErrorCodes,
  getFirebaseAuthErrorMessage,
  mapFirebaseAuthError,
  type FirebaseAuthErrorCode,
} from "./auth.errors";
export type { AuthSession, FirebaseUser, LoginCredentials } from "./auth.types";
