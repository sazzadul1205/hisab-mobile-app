import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { BottomNav } from "../../components/BottomNav";
import { SectionLabel } from "../../components/SectionLabel";
import { ListItem } from "../../components/ListItem";
import { Chevron } from "../../components/Chevron";
import { Note } from "../../components/Note";
import { Switch } from "../../components/Switch";
import { useAuth } from "../../auth/authContext";
import { formatAutoLock, getBudgetingEnabled, setBudgetingEnabled } from "../../services/settings";
import { getStorageEstimate, formatBytes } from "../../services/storage";

export default function Settings() {
  const navigate = useNavigate();
  const { autoLockMs } = useAuth();
  const [storageLabel, setStorageLabel] = useState("—");
  const [budgetingEnabled, setBudgetingEnabledState] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getStorageEstimate().then((est) => {
      if (cancelled) return;
      if (est.supported) setStorageLabel(`${formatBytes(est.usage)} used`);
      else setStorageLabel("Estimate unavailable");
    });
    getBudgetingEnabled().then((enabled) => {
      if (cancelled) return;
      setBudgetingEnabledState(enabled);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleBudgetingToggle = async (enabled) => {
    setBudgetingEnabledState(enabled);
    await setBudgetingEnabled(enabled);
  };

  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <div className="py-1.5 pb-3.5">
          <h2 className="m-0 text-[23px] font-bold tracking-[-0.5px] leading-tight">
            Settings
          </h2>
          <div className="text-[12.5px] text-(--muted) mt-0.75">
            Local data · no account
          </div>
        </div>

        <div className="stagger">
        <SectionLabel className="mt-1">Security</SectionLabel>
        <div className="bg-(--card) border border-(--line) rounded-[18px] overflow-hidden mb-4">
          <div onClick={() => navigate("/security/change-pin")}>
            <ListItem
              icon={
                <>
                  <rect x="4" y="10.5" width="16" height="10.5" rx="3" />
                  <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
                </>
              }
              title="Change PIN"
              trailing={<Chevron />}
            />
          </div>
          <div onClick={() => navigate("/security/auto-lock")}>
            <ListItem
              icon={
                <>
                  <circle cx="12" cy="12" r="8" />
                  <path d="M12 8v4l3 2" />
                </>
              }
              title="Auto-lock"
              subtitle={`After ${formatAutoLock(autoLockMs).toLowerCase()}`}
              trailing={<Chevron />}
            />
          </div>
          <div onClick={() => navigate("/security")}>
            <ListItem
              icon={
                <>
                  <path d="M4 12h16" />
                  <circle cx="12" cy="12" r="9" />
                </>
              }
              title="Security"
              subtitle="Biometric, lock now"
              trailing={<Chevron />}
            />
          </div>
        </div>

        <SectionLabel>App Preferences</SectionLabel>
        <div className="bg-(--card) border border-(--line) rounded-[18px] overflow-hidden mb-4">
          <div onClick={() => navigate("/settings/theme")}>
            <ListItem
              icon={
                <>
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </>
              }
              title="App Theme"
              subtitle="Colors and appearance"
              trailing={<Chevron />}
            />
          </div>
          <div className="px-4 py-3 flex items-center justify-between">
            <div>
              <div className="text-[14px] font-semibold text-(--ink)">Enable Budgeting</div>
              <div className="text-[11px] text-(--muted) mt-0.5">Set spending limits for categories</div>
            </div>
            <Switch checked={budgetingEnabled} onChange={handleBudgetingToggle} />
          </div>
          <div onClick={() => navigate("/settings/manual")}>
            <ListItem
              icon={
                <>
                  <path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4z" />
                  <path d="M8 9h8M8 13h5M8 17h8" />
                </>
              }
              title="User Manual"
              subtitle="How to use Hisab"
              trailing={<Chevron />}
            />
          </div>
          <div onClick={() => navigate("/settings/changelog")}>
            <ListItem
              icon={
                <>
                  <path d="M12 3v12M8 8l4-4 4 4" />
                  <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                </>
              }
              title="Changelog"
              subtitle="Version history and updates"
              trailing={<Chevron />}
            />
          </div>
          <div onClick={() => navigate("/settings/reminders")}>
            {import.meta.env.VITE_FIREBASE_API_KEY && (
              <ListItem
                icon={
                  <>
                    <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z" />
                    <circle cx="12" cy="10" r="1.4" fill="currentColor" />
                  </>
                }
                title="Reminders"
                subtitle="Morning + evening nudges"
                trailing={<Chevron />}
              />
            )}
          </div>
        </div>

        <SectionLabel>Data</SectionLabel>
        <div className="bg-(--card) border border-(--line) rounded-[18px] overflow-hidden mb-4">
          <div onClick={() => navigate("/categories")}>
            <ListItem
              icon={<path d="M4 5h7l2 2h7v12H4z" />}
              title="Categories"
              trailing={<Chevron />}
            />
          </div>
          <div onClick={() => navigate("/settings/export")}>
            <ListItem
              icon={
                <>
                  <path d="M12 3v12M8 11l4 4 4-4" />
                  <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                </>
              }
              title="Export financial data"
              subtitle="CSV for spreadsheets"
              trailing={<Chevron />}
            />
          </div>
          <div onClick={() => navigate("/backup")}>
            <ListItem
              icon={
                <>
                  <path d="M12 15V4M8 8l4-4 4 4" />
                  <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
                </>
              }
              title="Backup & restore"
              subtitle="Encrypted file"
              trailing={<Chevron />}
            />
          </div>
          <div onClick={() => navigate("/settings/storage")}>
            <ListItem
              icon={
                <>
                  <ellipse cx="12" cy="6" rx="8" ry="3" />
                  <path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6" />
                </>
              }
              title="Storage"
              subtitle={storageLabel}
              trailing={<Chevron />}
            />
          </div>
        </div>

        <SectionLabel>Danger zone</SectionLabel>
        <div
          className="bg-(--card) border border-(--line) rounded-[18px] overflow-hidden mb-4"
          onClick={() => navigate("/delete-all")}
        >
          <ListItem
            danger
            icon={<path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />}
            title="Delete all app data"
            trailing={<Chevron />}
          />
        </div>

        <Note>
          <b className="text-(--ink-2) font-semibold">Warning:</b> clearing
          browser data or uninstalling the PWA can erase local records. Keep an
          encrypted backup. Deletion always requires re-authentication and
          explicit confirmation.
        </Note>

        <div className="text-center mt-4">
          <span className="text-[11px] text-(--muted)">
            Hisab v1.0.1 · BDT only · offline-ready
          </span>
        </div>
      </div>
      </ScrollArea>
      <BottomNav active="settings" />
    </PhoneFrame>
  );
}
