/**
 * Firebase Messaging service worker.
 *
 * Config is passed as query params from the page registration URL so this
 * static file stays environment-agnostic (staging vs production).
 *
 * Background notification clicks use the same targetModule / targetId contract
 * as the foreground client (see resolve-fcm-route.ts).
 */
importScripts("https://www.gstatic.com/firebasejs/11.9.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.9.1/firebase-messaging-compat.js");

// Activate immediately so PushManager.subscribe does not race install.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

const params = new URL(self.location.href).searchParams;

firebase.initializeApp({
  apiKey: params.get("apiKey") || undefined,
  authDomain: params.get("authDomain") || undefined,
  projectId: params.get("projectId") || undefined,
  storageBucket: params.get("storageBucket") || undefined,
  messagingSenderId: params.get("messagingSenderId") || undefined,
  appId: params.get("appId") || undefined,
});

const messaging = firebase.messaging();

function resolveFcmRoute(data) {
  if (!data) return null;

  const targetModule = (data.targetModule || "").trim();
  const targetId = (data.targetId || "").trim();

  if (targetModule !== "event" || !targetId) return null;

  return `/events/${targetId}`;
}

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "Niche";
  const options = {
    body: payload.notification?.body,
    icon: payload.notification?.image,
    data: payload.data || {},
  };
  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  const route = resolveFcmRoute(data);
  if (!route) return;

  const origin = self.location.origin;
  // Prefer current locale from an open client; fall back to /en.
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      let locale = "en";
      for (const client of windowClients) {
        try {
          const segment = new URL(client.url).pathname.split("/").filter(Boolean)[0];
          if (segment === "en" || segment === "ar") {
            locale = segment;
            break;
          }
        } catch {
          // ignore bad client urls
        }
      }

      const targetUrl = `${origin}/${locale}${route}`;

      for (const client of windowClients) {
        if ("focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
      return undefined;
    }),
  );
});
