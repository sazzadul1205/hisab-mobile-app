import { useEffect, useState } from "react";
import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { AppBar } from "../../components/AppBar";
import { SectionLabel } from "../../components/SectionLabel";
import { Toggle } from "../../components/Toggle";
import { Alert } from "../../components/Alert";
import { Note } from "../../components/Note";
import { TimeInput } from "../../components/TimeInput";
import {
    DEFAULT_REMINDER_SETTINGS,
    getReminderSettings,
    setReminderSettings,
} from "../../services/settings";
import { requestNotificationPermission } from "../../services/reminders";

export default function Reminders() {
    const [settings, setSettings] = useState(DEFAULT_REMINDER_SETTINGS);
    const [error, setError] = useState("");
    const [permission, setPermission] = useState(
        "Notification" in globalThis ? Notification.permission : "unsupported",
    );

    useEffect(() => {
        let cancelled = false;
        getReminderSettings().then((s) => {
            if (cancelled) return;
            setSettings(s);
        });
        return () => {
            cancelled = true;
        };
    }, []);

    const commit = async (patch) => {
        setError("");
        try {
            const next = await setReminderSettings(patch);
            setSettings(next);
        } catch (err) {
            setError(err.message);
        }
    };

    const toggleEnabled = async (enabled) => {
        if (enabled && permission !== "granted") {
            const result = await requestNotificationPermission();
            setPermission(result);
            if (result !== "granted") {
                setError(
                    "Notifications are blocked in your browser. Enable them in site settings to receive reminders.",
                );
                return;
            }
        }
        commit({ enabled });
    };

    const morningTime = `${String(settings.morning).padStart(2, "0")}:00`;
    const eveningTime = `${String(settings.evening).padStart(2, "0")}:00`;

    return (
        <PhoneFrame>
            <StatusBar />
            <ScrollArea>
                <AppBar title="Reminders" />

                <SectionLabel className="mt-1">Daily nudges</SectionLabel>
                <div className="bg-(--card) border border-(--line) rounded-[18px] overflow-hidden mb-4">
                    <div className="flex items-center justify-between px-3.75 py-3.5 gap-3">
                        <div>
                            <b className="block text-[14px] font-semibold tracking-[-0.1px]">
                                Enable reminders
                            </b>
                            <small className="block text-[11.5px] text-(--muted) mt-0.5">
                                Morning + evening nudges
                            </small>
                        </div>
                        <Toggle
                            on={settings.enabled}
                            onClick={() => toggleEnabled(!settings.enabled)}
                        />
                    </div>
                    <div className="h-px bg-(--line-2)" />
                    <div className="flex items-center justify-between px-3.75 py-3.5 gap-3">
                        <div>
                            <b className="block text-[14px] font-semibold tracking-[-0.1px]">
                                Morning
                            </b>
                            <small className="block text-[11.5px] text-(--muted) mt-0.5">
                                {settings.morningLabel}
                            </small>
                        </div>
                        <TimeInput
                            value={morningTime}
                            onChange={(v) => {
                                const [h] = v.split(":");
                                commit({ morning: Number(h) });
                            }}
                        />
                    </div>
                    <div className="h-px bg-(--line-2)" />
                    <div className="flex items-center justify-between px-3.75 py-3.5 gap-3">
                        <div>
                            <b className="block text-[14px] font-semibold tracking-[-0.1px]">
                                Evening
                            </b>
                            <small className="block text-[11.5px] text-(--muted) mt-0.5">
                                {settings.eveningLabel}
                            </small>
                        </div>
                        <TimeInput
                            value={eveningTime}
                            onChange={(v) => {
                                const [h] = v.split(":");
                                commit({ evening: Number(h) });
                            }}
                        />
                    </div>
                </div>

                {error && (
                    <div className="text-[12px] font-semibold text-(--out) mb-3 text-center">
                        {error}
                    </div>
                )}

                {permission === "denied" && (
                    <Alert
                        tone="warn"
                        className="mb-3"
                        icon={
                            <>
                                <path d="M12 9v4" />
                                <circle cx="12" cy="17" r=".6" fill="currentColor" />
                                <path d="M10.3 3.9 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
                            </>
                        }
                        title="Notifications blocked"
                    >
                        Hisab can't send nudges right now. Allow notifications in
                        your browser's site settings, then toggle the switch above.
                    </Alert>
                )}

                <Note>
                    Reminders are local — they fire on this device at the times
                    you set. When the app is installed as a PWA, the service
                    worker keeps sending nudges even when the browser window is
                    closed. No data leaves your device.
                </Note>
            </ScrollArea>
        </PhoneFrame>
    );
}