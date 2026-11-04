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