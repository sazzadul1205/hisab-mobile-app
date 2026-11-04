import { useNavigate } from "react-router-dom";
import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { AppBar } from "../../components/AppBar";
import { ListItem } from "../../components/ListItem";
import { Chevron } from "../../components/Chevron";
import { Toggle } from "../../components/Toggle";
import { Alert } from "../../components/Alert";
import { SectionLabel } from "../../components/SectionLabel";
import { useAuth } from "../../auth/authContext";
import { formatAutoLock } from "../../services/settings";

export default function Security() {
  const navigate = useNavigate();
  const { autoLockMs, lock } = useAuth();

  const handleLockNow = () => {
    lock();
    navigate("/unlock", { replace: true });
  };

  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <AppBar title="Security" />

        <div className="stagger">
        <SectionLabel className="mt-0">Access protection</SectionLabel>
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
          <ListItem
            icon={
              <>
                <path d="M7 11V8a5 5 0 0 1 10 0v3" />
                <rect x="4" y="11" width="16" height="10" rx="3" />
                <circle cx="12" cy="16" r="1" fill="currentColor" />
              </>
            }
            title="Biometric unlock"
            subtitle="Not supported on this device"
            trailing={<Toggle />}
          />
        </div>

        <SectionLabel>Actions</SectionLabel>
        <div className="bg-(--card) border border-(--line) rounded-[18px] overflow-hidden mb-4">
          <div onClick={handleLockNow}>
            <ListItem
              icon={
                <>
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <path d="M10 17l5-5-5-5M15 12H3" />
                </>
              }
              title="Lock now"
              trailing={<Chevron />}
            />
          </div>
          <div onClick={() => navigate("/security/key-info")}>
            <ListItem
              icon={<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />}
              title="Key management info"
              trailing={<Chevron />}
            />
          </div>
        </div>

        <Alert
          tone="warn"
          icon={
            <>
              <path d="M12 9v4" />
              <circle cx="12" cy="17" r=".6" fill="currentColor" />
              <path d="M10.3 3.9 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
            </>
          }
          title="PIN recovery is not finalized"
        >
          Changing a PIN must preserve access to encrypted records. Recovery
          does not silently bypass encryption.
        </Alert>
      </div>
      </ScrollArea>
    </PhoneFrame>
  );
}
