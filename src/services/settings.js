/* ----------------------------------------------------------------
   App-level settings persisted in appSettings. Distinct from
   vault metadata (crypto) and backup-log (metadata).

   Auto-lock is in milliseconds. 0 means "never" (kept in the type
   for future use — not currently offered as a UI option).
   ---------------------------------------------------------------- */

import { db } from "../db/db";

export const AUTO_LOCK_KEY = "auto-lock-ms";
export const DEFAULT_AUTO_LOCK_MS = 2 * 60_000;

export const AUTO_LOCK_OPTIONS = [
    { value: 30_000, label: "30 seconds" },
    { value: 60_000, label: "1 minute" },
    { value: 2 * 60_000, label: "2 minutes" },
    { value: 5 * 60_000, label: "5 minutes" },
    { value: 10 * 60_000, label: "10 minutes" },
    { value: 30 * 60_000, label: "30 minutes" },
    { value: 60 * 60_000, label: "1 hour" },
];

export function formatAutoLock(ms) {
    if (!Number.isFinite(ms) || ms <= 0) return "Never";
    const match = AUTO_LOCK_OPTIONS.find((o) => o.value === ms);
    if (match) return match.label;
    // Fallback for arbitrary values (shouldn't happen, but keeps the UI honest)
    if (ms < 60_000) return `${Math.round(ms / 1000)} sec`;
    if (ms < 3_600_000) return `${Math.round(ms / 60_000)} min`;
    return `${Math.round(ms / 3_600_000)} hr`;
}

export async function getAutoLockMs() {
    const row = await db.appSettings.get(AUTO_LOCK_KEY);
    return typeof row?.value === "number" ? row.value : DEFAULT_AUTO_LOCK_MS;
}

export async function setAutoLockMs(ms) {
    if (typeof ms !== "number" || ms < 0) {
        throw new Error("INVALID_AUTO_LOCK");
    }
    await db.appSettings.put({ key: AUTO_LOCK_KEY, value: ms });
}

/* ----------------------------------------------------------------
   Last-used import account — persists so the Import form defaults
   to the same account on the next visit. Without this, users who
   import into bKash would see it default back to Cash on reload,
   silently breaking duplicate detection (which is per-account).
   ---------------------------------------------------------------- */
export const LAST_IMPORT_ACCOUNT_KEY = "import-account-id";

export async function getLastImportAccountId() {
    const row = await db.appSettings.get(LAST_IMPORT_ACCOUNT_KEY);
    return typeof row?.value === "string" ? row.value : null;
}

export async function setLastImportAccountId(id) {
    if (typeof id !== "string" || !id) throw new Error("INVALID_ACCOUNT_ID");
    await db.appSettings.put({ key: LAST_IMPORT_ACCOUNT_KEY, value: id });
}

/* ----------------------------------------------------------------
   Daily reminders — "Good morning" + "Good night" nudges.
   Stored as a single JSON blob so one read/writes the whole block.
   All times are 24-hour integers (hour only, 0-23). Minutes are
   ignored on purpose — the scheduler checks once per minute and
   fires when the wall clock crosses the configured hour.
   ---------------------------------------------------------------- */
export const REMINDER_KEY = "reminders";

export const DEFAULT_REMINDER_SETTINGS = {
    enabled: false,
    morning: 8, // 08:00
    evening: 21, // 21:00
    morningLabel: "Good morning — did you record today's purchases?",
    eveningLabel: "Good night — catch up on today before you sleep.",
};

export async function getReminderSettings() {
    const row = await db.appSettings.get(REMINDER_KEY);
    if (!row?.value) return { ...DEFAULT_REMINDER_SETTINGS };
    return { ...DEFAULT_REMINDER_SETTINGS, ...row.value };
}

export async function setReminderSettings(patch) {
    const current = await getReminderSettings();
    const next = { ...current, ...patch };
    // Basic validation — bad values would hang the scheduler.
    if (typeof next.morning !== "number" || next.morning < 0 || next.morning > 23) {
        throw new Error("INVALID_REMINDER_MORNING");
    }
    if (typeof next.evening !== "number" || next.evening < 0 || next.evening > 23) {
        throw new Error("INVALID_REMINDER_EVENING");
    }
    await db.appSettings.put({ key: REMINDER_KEY, value: next });
    // Let the scheduler and the service worker pick up the change.
    if (typeof window !== "undefined") {
        window.dispatchEvent(
            new CustomEvent("hisab:reminder-settings", { detail: next }),
        );
    }
    return next;
}