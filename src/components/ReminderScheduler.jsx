import { useEffect, useRef, useState } from "react";
import {
    startReminderScheduler,
    stopReminderScheduler,
} from "../services/reminders";
import { getReminderSettings } from "../services/settings";

/**
 * Mounts once at the app root. Owns the reminder scheduler lifecycle,
 * syncs settings to the service worker (so nudges fire even when the
 * browser window is closed), and renders an in-page banner when a
 * nudge fires while the tab is visible.
 */
export function ReminderScheduler() {
    const [banner, setBanner] = useState(null);
    const bannerTimer = useRef(null);

    useEffect(() => {
        startReminderScheduler();

        // Sync settings to the service worker on load and on every
        // settings change. The sw keeps its own copy so it can fire
        // nudges while the window is closed.
        const syncToSw = async () => {
            const settings = await getReminderSettings();
            if (!("serviceWorker" in navigator)) return;
            const reg = await navigator.serviceWorker.ready;
            if (reg.active) {
                reg.active.postMessage({
                    type: "HISAB_REMINDER_SETTINGS",
                    payload: settings,
                });
            }
        };
        syncToSw();

        const onReminder = (e) => {
            setBanner(e.detail);
            if (bannerTimer.current) clearTimeout(bannerTimer.current);
            bannerTimer.current = setTimeout(() => setBanner(null), 8_000);
        };
        window.addEventListener("hisab:reminder", onReminder);

        // Re-sync when the sw wakes up after being dormant.
        const onControllerChange = () => {
            syncToSw();
        };
        navigator.serviceWorker?.addEventListener(
            "controllerchange",
            onControllerChange,
        );

        return () => {
            window.removeEventListener("hisab:reminder", onReminder);
            navigator.serviceWorker?.removeEventListener(
                "controllerchange",
                onControllerChange,
            );
            if (bannerTimer.current) clearTimeout(bannerTimer.current);
            stopReminderScheduler();
        };
    }, []);

    if (!banner) return null;

    return (
        <div
            className={
                "fixed top-2.5 left-1/2 -translate-x-1/2 z-60 " +
                "w-[calc(100%-2rem)] max-w-105 " +
                "flex items-center gap-3 px-3.5 py-3 " +
                "rounded-2xl shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)] " +
                "bg-(--card) border border-(--line) animate-slide-down"
            }
        >
            <div
                className={
                    "w-9 h-9 rounded-[11px] flex-none grid place-items-center " +
                    "bg-(--brand-soft) text-(--brand-dk)"
                }
            >
                <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5 stroke-current fill-none stroke-[1.9] [stroke-linecap:round] [stroke-linejoin:round]"
                >
                    <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z" />
                    <circle cx="12" cy="10" r="1.4" fill="currentColor" />
                </svg>
            </div>
            <div className="flex-1 min-w-0">
                <b className="block text-[13.5px] font-semibold tracking-[-0.1px]">
                    {banner.title}
                </b>
                <small className="block text-[11.5px] text-(--muted) mt-0.5">
                    Tap to open Hisab
                </small>
            </div>
            <button
                type="button"
                onClick={() => setBanner(null)}
                className="text-[11px] font-semibold text-(--muted) bg-transparent border-0 cursor-pointer font-[inherit]"
            >
                Dismiss
            </button>
        </div>
    );
}