/* ----------------------------------------------------------------
   Push notifications via Firebase Cloud Messaging.

   Every exported function short-circuits to a safe no-op when
   Firebase isn't configured (VITE_FIREBASE_API_KEY missing). The
   app never crashes, never logs, and never makes a network call in
   that state.

   Public API:
     isPushEnabled()              -> boolean (sync)
     requestPermission()          -> "granted" | "denied" | "default" | "unsupported"
     getToken()                   -> string | null   (FCM registration token)
     onTokenRefresh(cb)           -> unsubscribe function
     onMessage(cb)                -> unsubscribe function  (foreground messages)
     showLocalNotification(title, body)  -> void  (fallback when FCM unavailable)
   ---------------------------------------------------------------- */

import { getFirebaseMessaging, isFirebaseEnabled } from "./firebase";
import { logger } from "../lib/logger";

const NOOP_UNSUB = () => {};

export function isPushEnabled() {
    return isFirebaseEnabled();
}

export function getPermissionState() {
    if (!("Notification" in globalThis)) return "unsupported";
    return Notification.permission;
}

/**
 * Ask the browser for notification permission. Does NOT touch FCM —
 * permission is a browser-level thing. Returns the resulting state.
 */
export async function requestPermission() {
    if (!("Notification" in globalThis)) return "unsupported";
    if (Notification.permission === "granted") return "granted";
    if (Notification.permission === "denied") return "denied";
    try {
        const result = await Notification.requestPermission();
        return result;
    } catch (err) {
        logger.warn("[notifications] permission prompt failed:", err);
        return "denied";
    }
}

/**
 * Register this device with FCM and return the registration token.
 * The token is what you'd send to your own server to target this
 * device. Returns null when FCM isn't configured or the browser
 * refuses.
 */
export async function getToken() {
    const messaging = await getFirebaseMessaging();
    if (!messaging) return null;
    if (getPermissionState() !== "granted") return null;

    try {
        // v9 SDK: getToken(messaging, { vapidKey })
        // The VAPID key is optional in the browser SDK — it's needed
        // only when you're not using the Firebase Console's default
        // sender. Leave it out for now; add VITE_FIREBASE_VAPID_KEY
        // later if you self-host the push sender.
        const { getToken } = await import("firebase/messaging");
        const token = await getToken(messaging);
        return token ?? null;
    } catch (err) {
        logger.warn("[notifications] getToken failed:", err);
        return null;
    }
}

/**
 * Listen for token refresh events. FCM rotates tokens occasionally;
 * re-register the new one with your server when this fires.
 */
export function onTokenRefresh(callback) {
    let cancelled = false;
    getFirebaseMessaging().then((messaging) => {
        if (!messaging || cancelled) return;
        import("firebase/messaging").then(({ onTokenRefresh: onRefresh }) => {
            if (cancelled) return;
            onRefresh(messaging, (token) => callback(token));
        });
    });
    return () => {
        cancelled = true;
    };
}

/**
 * Listen for foreground messages. Background messages are handled
 * by public/sw.js — this only covers "while the app is open".
 */
export function onMessage(callback) {
    let unsub = NOOP_UNSUB;
    getFirebaseMessaging().then((messaging) => {
        if (!messaging) return;
        import("firebase/messaging").then(({ onMessage: onMsg }) => {
            unsub = onMsg(messaging, (payload) => callback(payload));
        });
    });
    return () => unsub();
}

/**
 * Fire a local notification immediately — used as a fallback when
 * FCM isn't available and as a "test" button in the settings page.
 */
export async function showLocalNotification(title, body) {
    if (getPermissionState() !== "granted") {
        // Still dispatch the in-page banner so the user gets feedback.
        if (typeof window !== "undefined") {
            window.dispatchEvent(
                new CustomEvent("hisab:reminder", { detail: { title, body } }),
            );
        }
        return false;
    }
    try {
        if ("serviceWorker" in navigator) {
            const reg = await navigator.serviceWorker.ready;
            await reg.showNotification(title, {
                body,
                icon: "/pwa-192x192.png",
                badge: "/pwa-64x64.png",
                tag: "hisab-reminder-test",
            });
            return true;
        }
    } catch (err) {
        logger.warn("[notifications] showNotification failed:", err);
    }
    return false;
}

/** Convenience: request permission + register, return token or null. */
export async function enablePush() {
    const permission = await requestPermission();
    if (permission !== "granted") return null;
    return getToken();
}