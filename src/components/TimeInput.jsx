import { useState } from "react";

/**
 * A minimal time picker — two <select> elements for hour and minute.
 * Used by the Reminders settings page. Props:
 *   value: "HH:MM" string (or "" for blank)
 *   onChange: (value: "HH:MM") => void
 */
export function TimeInput({ value = "", onChange }) {
    const [hour, setHour] = useState("");
    const [minute, setMinute] = useState("");

    // Sync internal state when the parent passes a new value.
    if (value) {
        const [h, m] = value.split(":");
        if (h !== hour) setHour(h ?? "");
        if (m !== minute) setMinute(m ?? "");
    } else if (hour !== "" || minute !== "") {
        setHour("");
        setMinute("");
    }

    const emit = (h, m) => {
        if (h === "" && m === "") {
            onChange("");
            return;
        }
        onChange(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    };

    const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
    const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

    return (
        <div className="flex items-center gap-1">
            <select
                value={hour}
                onChange={(e) => {
                    setHour(e.target.value);
                    emit(e.target.value, minute);
                }}
                className={
                    "bg-(--card) border border-(--line) rounded-[10px] " +
                    "px-2 py-2 text-[14px] text-(--ink) font-[inherit] " +
                    "outline-none focus:border-(--brand) w-17"
                }
            >
                <option value="">--</option>
                {hours.map((h) => (
                    <option key={h} value={h}>
                        {h}
                    </option>
                ))}
            </select>
            <span className="text-(--muted) font-bold">:</span>
            <select
                value={minute}
                onChange={(e) => {
                    setMinute(e.target.value);
                    emit(hour, e.target.value);
                }}
                className={
                    "bg-(--card) border border-(--line) rounded-[10px] " +
                    "px-2 py-2 text-[14px] text-(--ink) font-[inherit] " +
                    "outline-none focus:border-(--brand) w-17"
                }
            >
                <option value="">--</option>
                {minutes.map((m) => (
                    <option key={m} value={m}>
                        {m}
                    </option>
                ))}
            </select>
        </div>
    );
}