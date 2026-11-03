import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { AppBar } from "../../components/AppBar";
import { ListItem } from "../../components/ListItem";
import { Chevron } from "../../components/Chevron";
import { Toggle } from "../../components/Toggle";
import { Alert } from "../../components/Alert";

function SectionLabel({ children }) {
  return (
    <div className="text-[11px] font-bold tracking-[0.09em] uppercase text-[var(--muted)] mb-2">
      {children}
    </div>
  );
}

export default function Security() {
  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <AppBar title="Security" />

        <SectionLabel>Access protection</SectionLabel>
        <div className="bg-white border border-[var(--line)] rounded-[18px] overflow-hidden mb-4">
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
          <ListItem
            icon={
              <>
                <circle cx="12" cy="12" r="8" />
                <path d="M12 8v4l3 2" />
              </>
            }
            title="Auto-lock"
            subtitle="After 2 minutes"
            trailing={<Chevron />}
          />
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
        <div className="bg-white border border-[var(--line)] rounded-[18px] overflow-hidden mb-4">
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
          <ListItem
            icon={<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />}
            title="Key management info"
            trailing={<Chevron />}
          />
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
      </ScrollArea>
    </PhoneFrame>
  );
}
