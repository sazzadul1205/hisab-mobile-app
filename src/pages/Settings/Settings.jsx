import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { BottomNav } from "../../components/BottomNav";
import { SectionLabel } from "../../components/SectionLabel";
import { ListItem } from "../../components/ListItem";
import { Chevron } from "../../components/Chevron";
import { Note } from "../../components/Note";
import { useAuth } from "../../auth/authContext";
import { formatAutoLock } from "../../services/settings";
import { getStorageEstimate, formatBytes } from "../../services/storage";

export default function Settings() {
  const navigate = useNavigate();
  const { autoLockMs } = useAuth();
  const [storageLabel, setStorageLabel] = useState("—");

  useEffect(() => {
    let cancelled = false;
    getStorageEstimate().then((est) => {
      if (cancelled) return;
      if (est.supported) setStorageLabel(`${formatBytes(est.usage)} used`);
      else setStorageLabel("Estimate unavailable");
    });
    return () => {
      cancelled = true;
    };
  }, []);

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

        <SectionLabel className="mt-1">Security</SectionLabel>
        <div className="bg-white border border-(--line) rounded-[18px] overflow-hidden mb-4">
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

        <SectionLabel>Data</SectionLabel>
        <div className="bg-white border border-(--line) rounded-[18px] overflow-hidden mb-4">
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
          className="bg-white border border-(--line) rounded-[18px] overflow-hidden mb-4"
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
            Hisab v1.0 · BDT only · offline-ready
          </span>
        </div>
      </ScrollArea>
      <BottomNav active="settings" />
    </PhoneFrame>
  );
}
