/* ----------------------------------------------------------------
   Firebase initialization — guarded.

   Reads VITE_FIREBASE_* from import.meta.env (injected by Vite).
   If VITE_FIREBASE_API_KEY is missing, `firebase` stays null and
   every caller short-circuits. The app boots normally with no
   network calls, no console errors, and no unhandled rejections.

   This file never throws. It either returns a configured Firebase
   instance or null — never a partial one.
   ---------------------------------------------------------------- */

import { initializeApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

function readEnv(key) {
    // Vite replaces import.meta.env.VITE_* at build time. Reading
    // via bracket notation avoids a hard dependency on the key existing.
    return import.meta.env?.[`VITE_${key}`] ?? "";
}

export const firebaseConfig = {
    apiKey: readEnv("FIREBASE_API_KEY"),
    appId: readEnv("FIREBASE_APP_ID"),
    projectId: readEnv("FIREBASE_PROJECT_ID"),
    storageBucket: readEnv("FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: readEnv("FIREBASE_MESSAGING_SENDER_ID"),
    measurementId: readEnv("FIREBASE_MEASUREMENT_ID"),
    authDomain: readEnv("FIREBASE_AUTH_DOMAIN"),
};

/** True when the feature is configured and ready to use. */
export function isFirebaseEnabled() {
    return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
}

let _app = null;
let _messaging = null;

export function getFirebaseApp() {
    if (!isFirebaseEnabled()) return null;
    if (_app) return _app;
    try {
        _app = initializeApp(firebaseConfig);
        return _app;
    } catch (err) {
        // Shouldn't happen — we validated the config above — but
        // never let a Firebase init failure take the app down.
        console.warn("[firebase] init failed:", err);
        return null;
    }
}

export async function getFirebaseMessaging() {
    const app = getFirebaseApp();
    if (!app) return null;
    if (_messaging) return _messaging;
    try {
        // isSupported() guards browsers that don't support
        // service workers / push at all (e.g. some mobile WebViews).
        const supported = await isSupported();
        if (!supported) return null;
        _messaging = getMessaging(app);
        return _messaging;
    } catch (err) {
        console.warn("[firebase] messaging unavailable:", err);
        return null;
    }
}