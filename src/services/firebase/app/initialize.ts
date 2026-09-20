import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";

import { getFirebaseClientConfig } from "./config";

let firebaseApp: FirebaseApp | undefined;

/**
 * Returns the singleton Firebase App instance.
 *
 * Initializes on first access using `getApps()` guard to prevent duplicate apps.
 *
 * Future extensions:
 * - `connectAuthEmulator`, `connectStorageEmulator`, etc. after initialization
 * - Separate named apps for multi-tenant scenarios via `initializeApp(config, name)`
 */
export function getFirebaseApp(): FirebaseApp {
  if (firebaseApp) {
    return firebaseApp;
  }

  const existingApps = getApps();

  if (existingApps.length > 0) {
    firebaseApp = getApp();
    return firebaseApp;
  }

  firebaseApp = initializeApp(getFirebaseClientConfig());
  return firebaseApp;
}

/**
 * Resets the cached app reference — useful in tests.
 * Does not delete the underlying Firebase app instance.
 */
export function resetFirebaseAppCache(): void {
  firebaseApp = undefined;
}
