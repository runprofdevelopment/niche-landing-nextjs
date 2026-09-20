import { getStorage, type FirebaseStorage } from "firebase/storage";

import { getFirebaseApp } from "../app";

let storageInstance: FirebaseStorage | undefined;

/**
 * Returns the singleton Firebase Storage instance.
 *
 * Lazily initialized on first access.
 */
export function getFirebaseStorage(): FirebaseStorage {
  storageInstance ??= getStorage(getFirebaseApp());
  return storageInstance;
}

/**
 * Resets the cached Storage instance — useful in tests.
 */
export function resetFirebaseStorageCache(): void {
  storageInstance = undefined;
}
