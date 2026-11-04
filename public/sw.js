/* eslint-disable */
/* ----------------------------------------------------------------
   Hisab background service worker (injectManifest mode).

   This file lives in /public and is bundled into the built app by
   vite-plugin-pwa's injectManifest. It is the ONLY code that runs
   when the PWA is installed but the browser window is closed —
   which is the whole point of the daily reminder feature.

   Responsibilities:
   1. Register the Workbox runtime precache (injected by the plugin).
   2. Poll every 60s and fire a Web Push-style local notification at
      the user-configured morning/evening hours.
   3. Handle notification clicks — focus or open the app.

   It does NOT touch IndexedDB directly. Settings are read from the
   app's IndexedDB via a small message round-trip from the window
   when the app is open; when the app is closed, the sw keeps its own
   in-memory copy that the window syncs on load. This keeps the sw
   dependency-free and testable.
   ---------------------------------------------------------------- */

import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { setCacheNameDetails } from "workbox-core";

setCacheNameDetails({ prefix: "hisab", suffix: "v1" });

cleanupOutdatedCaches();

precacheAndRoute(self.__WB_MANIFEST);

/* ---------- in-memory settings cache ---------- */
let reminderSettings = null;

function defaultSettings() {
    return {
        enabled: false,
        morning: 8,
        evening: 21,
        morningLabel: "Good morning — did you record today's purchases?",
        eveningLabel: "Good night — catch up on today before you sleep.",
    };
}

/* ---------- sync from the window ---------- */
self.addEventListener("message", (event) => {
    if (!event.data) return;
    if (event.data.type === "HISAB_REMINDER_SETTINGS") {
        reminderSettings = { ...defaultSettings(), ...event.data.payload };
    }
    if (event.data.type === "HISAB_REMINDER_REQUEST") {
        // Reply with current settings so the window can confirm sync.
        event.ports?.forEach((port) =>
            port.postMessage({
                type: "HISAB_REMINDER_SETTINGS",
                payload: reminderSettings ?? defaultSettings(),
            }),
        );
    }
});

/* ---------- notification click handler ---------- */
self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    // Focus an existing window or open the app.
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

/* ---------- scheduler ---------- */
let tickId = null;

function todayKey(d = new Date()) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

let lastFiredDay = null;
const firedToday = new Set();

function currentHourMinutes(d = new Date()) {
    return d.getHours() * 60 + d.getMinutes();
}

function alreadyFiredToday(kind) {
    return lastFiredDay === todayKey() && firedToday.has(kind);
}

async function notify(title, body) {
    const reg = await self.registration;
    await reg.showNotification(title, {
        body,
        icon: "/pwa-192x192.png",
        badge: "/pwa-64x64.png",
        tag: "hisab-reminder",
        requireInteraction: false,
    });
}

function tick() {
    const s = reminderSettings ?? defaultSettings();
    if (!s.enabled) return;

    if (lastFiredDay !== todayKey()) {
        lastFiredDay = todayKey();
        firedToday.clear();
    }

    const nowMin = currentHourMinutes();
    const morningMin = s.morning * 60;
    const eveningMin = s.evening * 60;

    if (
        nowMin >= morningMin &&
        nowMin < morningMin + 30 &&
        !alreadyFiredToday("morning")
    ) {
        firedToday.add("morning");
        notify(s.morningLabel, "Hisab reminder");
    }
    if (
        nowMin >= eveningMin &&
        nowMin < eveningMin + 30 &&
        !alreadyFiredToday("evening")
    ) {
        firedToday.add("evening");
        notify(s.eveningLabel, "Hisab reminder");
    }
}

function startScheduler() {
    if (tickId) clearInterval(tickId);
    tickId = setInterval(tick, 60_000);
    tick();
}

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
    startScheduler();
});

self.addEventListener("install", () => {
    self.skipWaiting();
});