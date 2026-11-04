import { useState } from "react";
import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { AppBar } from "../../components/AppBar";
import { SectionLabel } from "../../components/SectionLabel";
import { Note } from "../../components/Note";
import { useAuth } from "../../auth/authContext";
import { AUTO_LOCK_OPTIONS } from "../../services/settings";
import { logger } from "../../lib/logger";

function Checkmark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-4.5 h-4.5 stroke-(--brand) fill-none stroke-[2.4]
                 [stroke-linecap:round] [stroke-linejoin:round]"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default function AutoLock() {
  const { autoLockMs, updateAutoLock } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSelect = async (value) => {
    if (saving || value === autoLockMs) return;
    setError("");
    setSaving(true);
    try {
      await updateAutoLock(value);
    } catch (err) {
      logger.error(err);
      setError("Could not save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <AppBar title="Auto-lock" />

        <div className="stagger">
        <SectionLabel className="mt-1">Lock after</SectionLabel>

        <div className="bg-(--card) border border-(--line) rounded-[18px] overflow-hidden mb-3">
          {AUTO_LOCK_OPTIONS.map((opt, i) => {
            const isSelected = opt.value === autoLockMs;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                disabled={saving}
                className={
                  "w-full flex items-center justify-between " +
                  "px-3.75 py-3.5 text-left font-[inherit] " +
                  "bg-(--card) border-0 cursor-pointer " +
                  (i < AUTO_LOCK_OPTIONS.length - 1
                    ? "border-b border-(--line-2) "
                    : "") +
                  (saving ? "opacity-60 cursor-wait" : "")
                }
              >
                <span
                  className={
                    "text-[14px] " +
                    (isSelected
                      ? "font-semibold text-(--ink)"
                      : "text-(--ink-2)")
                  }
                >
                  {opt.label}
                </span>
                {isSelected && <Checkmark />}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="text-[12px] font-semibold text-(--out) mb-3 text-center">
            {error}
          </div>
        )}

        <Note>
          Hisab locks after this much inactivity. Changing the interval counts
          as activity, so the new clock starts from now. While locked, the PIN
          is required to unlock.
        </Note>
      </div>
      </ScrollArea>
    </PhoneFrame>
  );
}
