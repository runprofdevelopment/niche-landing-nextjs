import { env, isFirebaseConfigured } from "@/config/env";

export const firebaseConfigKeys = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

export type FirebaseClientConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

/**
 * Returns Firebase web client config from public env vars.
 * Throws when required Firebase env is missing.
 */
export function getFirebaseClientConfig(): FirebaseClientConfig {
  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* environment variables.",
    );
  }

  return {
    apiKey: env.firebase.apiKey,
    authDomain: env.firebase.authDomain,
    projectId: env.firebase.projectId,
    storageBucket: env.firebase.storageBucket,
    messagingSenderId: env.firebase.messagingSenderId,
    appId: env.firebase.appId,
  };
}

/** VAPID / Web Push key used by `getToken` for FCM. */
export function getFirebaseMessagingKey(): string {
  return env.firebase.messagingKey;
}

export function isFirebaseMessagingConfigured(): boolean {
  return isFirebaseConfigured() && Boolean(env.firebase.messagingKey);
}
