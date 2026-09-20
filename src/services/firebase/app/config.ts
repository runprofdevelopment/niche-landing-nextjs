/**
 * Firebase App configuration bridge.
 *
 * Re-exports validated config from `@/config/firebase`.
 * Service modules import from here to keep SDK wiring inside `services/firebase/`.
 */

export {
  getFirebaseClientConfig,
  getFirebaseMessagingKey,
  isFirebaseMessagingConfigured,
  type FirebaseClientConfig,
} from "@/config/firebase";
