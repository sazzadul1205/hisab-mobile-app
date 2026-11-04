/* eslint-disable */
/* ----------------------------------------------------------------
   Hisab background service worker (injectManifest mode).

   Two layers:
   1. Workbox precache — injected by vite-plugin-pwa, handles app
      shell caching and offline-first behaviour.
   2. Firebase Cloud Messaging — loaded dynamically via importScripts
      ONLY when VITE_FIREBASE_API_KEY is present. Handles background
      push messages and notification clicks.

   When Firebase isn't configured, this file is a pure Workbox
   runtime — no push, no network, no Firebase code loaded.
   ---------------------------------------------------------------- */

import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { setCacheNameDetails } from "workbox-core";

setCacheNameDetails({ prefix: "hisab", suffix: "v1" });
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

/* ---------- Firebase — loaded only if configured ---------- */
const FIREBASE_CONFIG = {
    apiKey: "__VITE_FIREBASE_API_KEY__",
    appId: "__VITE_FIREBASE_APP_ID__",
    projectId: "__VITE_FIREBASE_PROJECT_ID__",
    storageBucket: "__VITE_FIREBASE_STORAGE_BUCKET__",
    messagingSenderId: "__VITE_FIREBASE_MESSAGING_SENDER_ID__",
    measurementId: "__VITE_FIREBASE_MEASUREMENT_ID__",
    authDomain: "__VITE_FIREBASE_AUTH_DOMAIN__",
};

const FIREBASE_ENABLED = Boolean(FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId);

if (FIREBASE_ENABLED) {
    // Firebase SDK is loaded from Google's CDN. The URLs are stable
    // and cached by the browser after the first load.
    importScripts(
        "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js",
        "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js",
    );

    firebase.initializeApp(FIREBASE_CONFIG);
    const messaging = firebase.messaging();

    messaging.onMessage((payload) => {
        const title = payload.notification?.title ?? "Hisab";
        const body = payload.notification?.body ?? "";
        self.registration.showNotification(title, {
            body,
            icon: "/pwa-192x192.png",
            badge: "/pwa-64x64.png",
            tag: "hisab-push",
        });
    });
}

/* ---------- notification click ---------- */
self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: "window", includeInController: true }).then((wins) => {
            for (const win of wins) {
                if (win.visible && "focus" in win) {
                    win.focus();
                    return;
                }
            }
            if (clients.openWindow) return clients.openWindow("/");
        }),
    );
});

/* ---------- activate + claim ---------- */
self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("install", () => {
    self.skipWaiting();
});
