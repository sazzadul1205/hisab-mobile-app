import { useState } from "react";
import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { AppBar } from "../../components/AppBar";
import { SegmentedControl } from "../../components/SegmentedControl";
import { Field, TextInput } from "../../components/FormField";
import { Button } from "../../components/Button";
import { Alert } from "../../components/Alert";
import { SectionLabel } from "../../components/SectionLabel";
import { ListItem } from "../../components/ListItem";
import { Chevron } from "../../components/Chevron";
import { StatusPill } from "../../components/StatusPill";
import { Note } from "../../components/Note";

const TABS = [
  { value: "backup", label: "Backup" },
  { value: "restore", label: "Restore" },
  { value: "history", label: "History" },
];

function BackupTab() {
  return (
    <>
      <Alert
        tone="info"
        icon={
          <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4M12 16h.01" />
          </>
        }
        title="What gets backed up"
        className="mb-3.5"
      >
        All accounts, transactions, categories, and settings. The file is
        encrypted with the password you choose below.
      </Alert>

      <Field label="Backup password">
        <TextInput type="password" defaultValue="backuppass" />
      </Field>

      <Field label="Confirm password">
        <TextInput type="password" defaultValue="backuppass" />
      </Field>

      <Button>Create encrypted backup</Button>

      <Alert
        tone="warn"
        className="mt-4"
        icon={
          <>
            <path d="M12 9v4" />
            <circle cx="12" cy="17" r=".6" fill="currentColor" />
            <path d="M10.3 3.9 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
          </>
        }
        title="Lost password = unrecoverable"
      >
        Keep this password somewhere safe. It cannot be reset.
      </Alert>
    </>
  );
}

function RestoreTab() {
  return (
    <>
      <SectionLabel className="mt-0">Restore from file</SectionLabel>
      <div className="bg-white border border-(--line) rounded-[18px] overflow-hidden mb-3">
        <ListItem
          icon={
            <>
              <path d="M12 15V4M8 8l4-4 4 4" />
              <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
            </>
          }
          title="Select backup file"
          trailing={<Chevron />}
        />
        <ListItem
          icon={
            <>
              <rect x="4" y="10.5" width="16" height="10.5" rx="3" />
              <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
            </>
          }
          title="Validate & preview"
          subtitle="Password + contents"
          trailing={<Chevron />}
        />
      </div>

      <Alert
        tone="danger"
        className="mb-3"
        icon={
          <>
            <path d="M12 9v4" />
            <circle cx="12" cy="17" r=".6" fill="currentColor" />
            <path d="M10.3 3.9 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
          </>
        }
        title="Wrong password = cannot decrypt"
      >
        There is no recovery. If the password is lost, the backup file is
        unrecoverable.
      </Alert>

      <Note>
        Restore never silently overwrites existing data. Any conflict requires
        an explicit choice.
      </Note>
    </>
  );
}

function BackupFileRow({ name, meta, verified = true }) {
  return (
    <div className="flex items-center gap-2.75 py-2.75">
      <div className="w-7.5 h-7.5 rounded-[9px] flex-none grid place-items-center bg-(--brand-soft) text-(--brand-dk)">
        <svg
          viewBox="0 0 24 24"
          className="w-3.5 h-3.5 stroke-current fill-none stroke-2 [stroke-linecap:round] [stroke-linejoin:round]"
        >
          <path d="M12 15V4M8 8l4-4 4 4" />
          <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <b className="block text-[12.5px] font-semibold tracking-[-0.1px] truncate">
          {name}
        </b>
        <small className="block text-[11px] text-(--muted) mt-0.5">
          {meta}
        </small>
      </div>
      {verified && <StatusPill tone="ok">Verified</StatusPill>}
    </div>
  );
}

function HistoryTab() {
  const backups = [
    {
      name: "backup-2026-10-29.hisab",
      meta: "Today · 1.4 MB · encrypted",
      verified: true,
    },
    {
      name: "backup-2026-10-22.hisab",
      meta: "22 Oct · 1.3 MB · encrypted",
      verified: true,
    },
    {
      name: "backup-2026-10-15.hisab",
      meta: "15 Oct · 1.2 MB · encrypted",
      verified: true,
    },
  ];

  return (
    <>
      <SectionLabel className="mt-0">Recent backups</SectionLabel>
      <div className="bg-white border border-(--line) rounded-[18px] px-3.5 py-1.5">
        {backups.map((b, i) => (
          <div
            key={b.name}
            className={
              i < backups.length - 1 ? "border-b border-(--line-2)" : ""
            }
          >
            <BackupFileRow {...b} />
          </div>
        ))}
      </div>

      <Note className="mt-3">
        Backups are stored on this device. To keep a copy off-device, share the
        file via your phone's share sheet after creating it.
      </Note>
    </>
  );
}

export default function Backup() {
  const [tab, setTab] = useState("backup");

  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <AppBar title="Backup & restore" />

        <SegmentedControl value={tab} options={TABS} onChange={setTab} />

        {tab === "backup" && <BackupTab />}
        {tab === "restore" && <RestoreTab />}
        {tab === "history" && <HistoryTab />}
      </ScrollArea>
    </PhoneFrame>
  );
}
