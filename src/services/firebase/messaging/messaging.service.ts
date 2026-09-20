import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type Messaging,
  type Unsubscribe,
} from "firebase/messaging";

import {
  getFirebaseClientConfig,
  getFirebaseMessagingKey,
  isFirebaseMessagingConfigured,
} from "@/config/firebase";
import { defaultLocale, locales } from "@/config/i18n";
import { getFirebaseApp } from "@/services/firebase/app";
import { logger } from "@/services/logger";

import { FCM_TOKEN_KEY } from "./constants";
import { addDeviceToken, removeDeviceToken } from "./device-token-api";
import { resolveFcmRoute } from "./resolve-fcm-route";

let messagingInstance: Messaging | undefined;
let unsubscribeForeground: Unsubscribe | null = null;
let setupPromise: Promise<void> | null = null;
let notificationPatched = false;

function logInfo(...args: unknown[]) {
  if (process.env.NODE_ENV === "development") {
    logger.info("[FCM]", ...args);
  }
}

function logWarn(...args: unknown[]) {
  if (process.env.NODE_ENV === "development") {
    logger.warn("[FCM]", ...args);
  }
}

function logError(...args: unknown[]) {
  logger.error("[FCM]", ...args);
}

function readStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(FCM_TOKEN_KEY);
}

function storeToken(token: string) {
  localStorage.setItem(FCM_TOKEN_KEY, token);
}

function clearStoredToken() {
  localStorage.removeItem(FCM_TOKEN_KEY);
}

function currentLocalePrefix(): string {
  if (typeof window === "undefined") return `/${defaultLocale}`;
  const segment = window.location.pathname.split("/").filter(Boolean)[0];
  if (segment && (locales as readonly string[]).includes(segment)) {
    return `/${segment}`;
  }
  return `/${defaultLocale}`;
}

function navigateFromNotification(route: string) {
  const path = route.startsWith("/") ? route : `/${route}`;
  window.location.assign(`${currentLocalePrefix()}${path}`);
}

function getFirebaseMessaging(): Messaging {
  if (messagingInstance) return messagingInstance;
  messagingInstance = getMessaging(getFirebaseApp());
  return messagingInstance;
}

function buildNotificationOptions(payload: {
  body?: string | undefined;
  image?: string | undefined;
}): NotificationOptions {
  const options: NotificationOptions = {};
  if (payload.body) options.body = payload.body;
  if (payload.image) options.icon = payload.image;
  return options;
}

function waitUntilWorkerActivated(worker: ServiceWorker): Promise<void> {
  if (worker.state === "activated") return Promise.resolve();

  return new Promise((resolve, reject) => {
    const onChange = () => {
      if (worker.state === "activated") {
        worker.removeEventListener("statechange", onChange);
        resolve();
        return;
      }
      if (worker.state === "redundant") {
        worker.removeEventListener("statechange", onChange);
        reject(new Error("Service worker became redundant before activation"));
      }
    };
    worker.addEventListener("statechange", onChange);
  });
}

/**
 * Registers the FCM service worker and waits until it is active.
 * Calling `getToken` before activation causes:
 * "Subscription failed - no active Service Worker".
 */
async function registerMessagingServiceWorker(swUrl: string): Promise<ServiceWorkerRegistration> {
  // Scope `/` so PushManager can subscribe against the page origin.
  let registration = await navigator.serviceWorker.register(swUrl, { scope: "/" });

  const pending = registration.installing ?? registration.waiting;
  if (pending) {
    await waitUntilWorkerActivated(pending);
  }

  // Ensures an active worker is available for PushManager.subscribe.
  registration = await navigator.serviceWorker.ready;

  if (!registration.active) {
    throw new Error("Firebase messaging service worker registered but is not active");
  }

  return registration;
}

/**
 * Tears down the foreground listener. Does not call the backend.
 * Call {@link teardownFirebaseMessages} on logout to also unregister the token.
 */
export function resetFcm() {
  if (unsubscribeForeground) {
    unsubscribeForeground();
    unsubscribeForeground = null;
  }
  setupPromise = null;
  if (typeof window !== "undefined") {
    (window as Window & { _fcmActive?: boolean })._fcmActive = false;
  }
}

/**
 * Registers FCM (permission → SW → token → addDeviceToken → foreground listener).
 * Safe to call multiple times; duplicate setup is skipped while a listener is active.
 * Call after login / when an authenticated session is restored.
 */
export async function setupFirebaseMessages(): Promise<void> {
  if (typeof window === "undefined") return;

  if (!isFirebaseMessagingConfigured()) {
    logWarn("messaging key / Firebase config missing — skipping FCM setup");
    return;
  }

  if (unsubscribeForeground) {
    logInfo("already initialised, skipping");
    return;
  }

  if (setupPromise) {
    return setupPromise;
  }

  setupPromise = (async () => {
    try {
      const supported = await isSupported();
      if (!supported) {
        logWarn("Firebase Messaging is not supported in this browser");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        logWarn("notification permission denied");
        return;
      }

      const firebaseConfig = getFirebaseClientConfig();
      const swParams = new URLSearchParams({
        apiKey: firebaseConfig.apiKey,
        authDomain: firebaseConfig.authDomain,
        projectId: firebaseConfig.projectId,
        storageBucket: firebaseConfig.storageBucket,
        messagingSenderId: firebaseConfig.messagingSenderId,
        appId: firebaseConfig.appId,
      });
      const swUrl = `/firebase-messaging-sw.js?${swParams.toString()}`;
      const serviceWorker = await registerMessagingServiceWorker(swUrl);

      const messaging = getFirebaseMessaging();
      const token = await getToken(messaging, {
        vapidKey: getFirebaseMessagingKey(),
        serviceWorkerRegistration: serviceWorker,
      });

      if (token) {
        storeToken(token);
        try {
          await addDeviceToken(token);
          logInfo("token registered");
        } catch (registerError) {
          logWarn(
            "addDeviceToken failed; token stored locally and will retry on next login",
            registerError,
          );
        }
      }

      if (!notificationPatched) {
        // Chromium: empty title renders a blank popup — auto-close those.
        const OriginalNotification = window.Notification;
        window.Notification = class ExtendedNotification extends OriginalNotification {
          constructor(title: string, options?: NotificationOptions) {
            super(title, options);
            if (!title) {
              this.onshow = () => this.close();
            }
          }
        } as typeof Notification;
        notificationPatched = true;
      }

      unsubscribeForeground = onMessage(messaging, (payload) => {
        logInfo("foreground message:", payload);

        const notification = new Notification(
          payload.notification?.title ?? "",
          buildNotificationOptions({
            body: payload.notification?.body,
            image: payload.notification?.image,
          }),
        );

        notification.onclick = () => {
          logInfo("notification clicked:", {
            title: payload.notification?.title,
            data: payload.data,
          });
          window.focus();
          notification.close();
          const route = resolveFcmRoute(payload.data);
          if (route) {
            navigateFromNotification(route);
          }
        };
      });

      (window as Window & { _fcmActive?: boolean })._fcmActive = true;
      logInfo("listener active");
    } catch (error) {
      logError("setup error:", error);
      resetFcm();
    } finally {
      setupPromise = null;
    }
  })();

  return setupPromise;
}

/**
 * Removes the device token from the backend (while still authenticated), then resets listeners.
 * Call from logout **before** Firebase sign-out so the GraphQL Bearer token is still valid.
 */
export async function teardownFirebaseMessages(): Promise<void> {
  const token = readStoredToken();
  if (token) {
    try {
      await removeDeviceToken(token);
      logInfo("token removed");
    } catch (error) {
      logWarn("removeDeviceToken failed", error);
    }
    clearStoredToken();
  }
  resetFcm();
}
