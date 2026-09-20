/**
 * Firebase Cloud Messaging service.
 */

export { FCM_TOKEN_KEY } from "./constants";
export { resetFcm, setupFirebaseMessages, teardownFirebaseMessages } from "./messaging.service";
export {
  FCM_TARGET_MODULES,
  isFcmTargetModule,
  resolveFcmRoute,
  type FcmDataPayload,
  type FcmTargetModule,
} from "./resolve-fcm-route";
