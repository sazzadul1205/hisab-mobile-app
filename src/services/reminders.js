/* ----------------------------------------------------------------
   Daily reminder scheduler.

   Fires a "Good morning" / "Good night" nudge at user-configurable
   hours. Designed to be driven by a single React component that
   mounts once at the root, so the logic itself is pure and testable.

   Two layers:
   1. In-app  — fires while the tab is visible. Uses Notification API
      when permission is granted, otherwise falls back to an in-page
      banner so the user still gets the nudge.
   2. Service worker — when the PWA is installed and the app is
      closed, the sw.js in /public polls once per minute and fires a
      local notification at the configured hours. This is the only
      path that reaches the user while the browser window is shut.

   The scheduler is idempotent: calling start() again just re-arms with
   the latest settings. It never schedules more than one tick at a time.
   ---------------------------------------------------------------- */

import { getReminderSettings } from "./settings";

const TICK_MS = 30_000; // check twice a minute — cheap and responsive

let timerId = null;
let lastFiredDay = null; // "YYYY-MM-DD" — prevents double-firing per day
let currentSettings = null;

/* ---------- helpers ---------- */

function todayKey(d = new Date()) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function currentHourMinutes(d = new Date()) {
    return d.getHours() * 60 + d.getMinutes();
}

/** True if we already fired this reminder today. */
function alreadyFiredToday(kind) {
    return lastFiredDay === todayKey() && firedToday.has(kind);
}
const firedToday = new Set();

function resetDayTracker() {
    lastFiredDay = todayKey();
    firedToday.clear();
}

/* ---------- notification delivery ---------- */

async function notify(title, body) {
    // Prefer a real OS notification when permission is granted.
    if ("Notification" in globalThis && Notification.permission === "granted") {
        try {
            // registration.showNotification requires a service worker.
            // navigator.serviceWorker.ready resolves even for the
            // auto-generated PWA sw, so this works in installed mode.
            const reg = await navigator.serviceWorker.ready;
            return reg.showNotification(title, {
                body,
                icon: "/pwa-192x192.png",
                badge: "/pwa-64x64.png",
                tag: "hisab-reminder", // dedupes across devices/browsers
            });
        } catch {
            // Fall through to the in-page banner.
        }
    }

    // In-page fallback — dispatch an event the UI can listen to.
    window.dispatchEvent(
        new CustomEvent("hisab:reminder", { detail: { title, body } }),
    );
}

/* ---------- tick ---------- */

function tick() {
    if (!currentSettings || !currentSettings.enabled) return;

    // Roll the day tracker at the first tick after midnight.
    if (lastFiredDay !== todayKey()) resetDayTracker();

    const nowMin = currentHourMinutes();
    const morningMin = currentSettings.morning * 60;
    const eveningMin = currentSettings.evening * 60;

    // Fire within a 30-minute window after the scheduled hour so a
    // tick just before the hour doesn't miss.
    if (
        nowMin >= morningMin &&
        nowMin < morningMin + 30 &&
        !alreadyFiredToday("morning")
    ) {
        firedToday.add("morning");
        notify(currentSettings.morningLabel, "Hisab reminder");
    }
    if (
        nowMin >= eveningMin &&
        nowMin < eveningMin + 30 &&
        !alreadyFiredToday("evening")
    ) {
        firedToday.add("evening");
        notify(currentSettings.eveningLabel, "Hisab reminder");
    }
}

/* ---------- public API ---------- */

export function startReminderScheduler() {
    stopReminderScheduler();
    // Kick once immediately so a freshly-armed setting takes effect.
    getReminderSettings().then((settings) => {
        currentSettings = settings;
        tick();
    });
    timerId = setInterval(() => {
        getReminderSettings().then((settings) => {
            currentSettings = settings;
            tick();
        });
    }, TICK_MS);
    // Re-arm instantly when settings change (no need to wait for the next tick).
    window.addEventListener("hisab:reminder-settings", onSettingsChange);
}

function onSettingsChange(e) {
    currentSettings = e.detail;
}

export function stopReminderScheduler() {
    if (timerId) {
        clearInterval(timerId);
        timerId = null;
    }
    window.removeEventListener("hisab:reminder-settings", onSettingsChange);
    currentSettings = null;
}

/** Re-arm after settings change without losing the day tracker. */
export function refreshReminderScheduler() {
    if (!timerId) return; // not running — nothing to refresh
    getReminderSettings().then((settings) => {
        currentSettings = settings;
    });
}

/* ---------- permission prompt helper ---------- */

export async function requestNotificationPermission() {
    if (!("Notification" in globalThis)) return "unsupported";
    if (Notification.permission === "granted") return "granted";
    if (Notification.permission === "denied") return "denied";
    const result = await Notification.requestPermission();
    return result;
}