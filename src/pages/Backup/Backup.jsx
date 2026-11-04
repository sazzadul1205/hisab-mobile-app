import { useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { format } from "date-fns";
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
import { db } from "../../db/db";
import { logger } from "../../lib/logger";
import {
  createBackupFile,
  readBackupFile,
  restoreBackup,
  recordBackupInLog,
  totalRecordCount,
  BACKUP_LOG_KEY,
  BackupValidationError,
  BackupPasswordError,
} from "../../services/backup";

const TABS = [
  { value: "backup", label: "Backup" },
  { value: "restore", label: "Restore" },
  { value: "history", label: "History" },
];

/* ----------------------------------------------------------------
   Helpers
   ---------------------------------------------------------------- */
function filenameFor() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `backup-${y}-${m}-${day}.hisab`;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function errorMessage(err) {
  if (err instanceof BackupPasswordError) {
    return "Wrong password. Check it and try again.";
  }
  if (err instanceof BackupValidationError) {
    switch (err.code) {
      case "INVALID_JSON":
        return "This file is not a valid Hisab backup.";
      case "WRONG_FORMAT":
        return "This file is not a Hisab backup.";
      case "UNSUPPORTED_VERSION":
        return "This backup was made with a newer version of Hisab.";
      case "MALFORMED_KDF":
      case "MALFORMED_CIPHER":
      case "MALFORMED_DATA":
      case "MALFORMED_BASE64":
      case "INVALID_PLAINTEXT":
      case "MALFORMED_RECORDS":
        return "This backup file is corrupted.";
      default:
        return "This backup file could not be read.";
    }
  }
  return "Something went wrong. Try again.";
}

/* ================================================================
   Tab: Backup
   ================================================================ */
function BackupTab({ onCreated }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const handleCreate = async () => {
    setError("");
    setSuccess(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setBusy(true);
    try {
      const { contents, counts, createdAt } = await createBackupFile(password);
      const blob = new Blob([contents], { type: "application/json" });
      const filename = filenameFor();
      downloadBlob(blob, filename);
      await recordBackupInLog({
        filename,
        sizeBytes: blob.size,
        counts,
      });
      onCreated?.();
      setSuccess({
        filename,
        size: blob.size,
        counts,
        total: totalRecordCount(counts),
        createdAt,
      });
      setPassword("");
      setConfirm("");
    } catch (err) {
      logger.error(err);
      setError("Could not create backup. Try again.");
    } finally {
      setBusy(false);
    }
  };

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
        Accounts, transactions, categories, and reconciliation records.
        Encrypted with the password you choose below — the PIN is not involved.
      </Alert>

      <Field label="Backup password" hint="min 8 characters">
        <TextInput
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Choose a strong password"
        />
      </Field>

      <Field label="Confirm password">
        <TextInput
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Repeat the password"
        />
      </Field>

      {error && (
        <div className="text-[12px] font-semibold text-(--out) mb-3 text-center">
          {error}
        </div>
      )}

      {success && (
        <Alert
          tone="ok"
          className="mb-3"
          icon={
            <>
              <circle cx="12" cy="12" r="9" />
              <path d="M9 12l2 2 4-4" />
            </>
          }
          title="Backup created"
        >
          <span className="block">
            {success.filename} · {formatBytes(success.size)} · {success.total}{" "}
            records
          </span>
          <span className="block mt-1">
            Check your downloads — the file should be there.
          </span>
        </Alert>
      )}

      <Button onClick={handleCreate} disabled={busy}>
        {busy ? "Encrypting…" : "Create encrypted backup"}
      </Button>

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
        Keep this password somewhere safe. It cannot be reset. The PIN does not
        unlock the backup file.
      </Alert>
    </>
  );
}

/* ================================================================
   Tab: Restore
   ================================================================ */
function RestoreTab({ onRestored }) {
  const fileRef = useRef(null);
  const [stage, setStage] = useState("idle"); // idle | preview | restoring
  const [filename, setFilename] = useState("");
  const [rawText, setRawText] = useState("");
  const [password, setPassword] = useState("");
  const [decrypted, setDecrypted] = useState(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const reset = () => {
    setStage("idle");
    setFilename("");
    setRawText("");
    setPassword("");
    setDecrypted(null);
    setError("");
    setResult(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleFile = async (e) => {
    setError("");
    setResult(null);
    const file = e.target.files?.[0];
    if (!file) return;
    setFilename(file.name);
    try {
      const text = await file.text();
      setRawText(text);
    } catch (err) {
      logger.error(err);
      setError("Could not read the file.");
    }
  };

  const handleValidate = async () => {
    setError("");
    setResult(null);

    if (!rawText) {
      setError("Choose a backup file first.");
      return;
    }
    if (!password) {
      setError("Enter the backup password.");
      return;
    }

    try {
      const { data, counts, createdAt } = await readBackupFile(
        rawText,
        password,
      );
      setDecrypted({ data, counts, createdAt });
      setStage("preview");
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const handleRestore = async (mode) => {
    if (!decrypted) return;
    setError("");
    setStage("restoring");
    try {
      const res = await restoreBackup(decrypted.data, mode);
      setResult(res);
      setStage("preview");
      onRestored?.();
    } catch (err) {
      logger.error(err);
      setError("Restore failed. Your existing data was not changed.");
      setStage("preview");
    }
  };

  return (
    <>
      {stage === "idle" && (
        <>
          <SectionLabel className="mt-0">Restore from file</SectionLabel>

          <div className="bg-(--card) border border-(--line) rounded-[18px] overflow-hidden mb-3">
            <div onClick={() => fileRef.current?.click()}>
              <ListItem
                icon={
                  <>
                    <path d="M12 15V4M8 8l4-4 4 4" />
                    <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
                  </>
                }
                title={filename || "Select backup file"}
                subtitle={
                  filename
                    ? "Tap to choose a different file"
                    : ".hisab files only"
                }
                trailing={<Chevron />}
              />
            </div>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".hisab,application/json"
            onChange={handleFile}
            className="hidden"
          />

          <Field label="Backup password">
            <TextInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password used when creating the file"
            />
          </Field>

          {error && (
            <div className="text-[12px] font-semibold text-(--out) mb-3 text-center">
              {error}
            </div>
          )}

          <Button onClick={handleValidate} disabled={!rawText || !password}>
            Validate &amp; preview
          </Button>

          <Alert
            tone="danger"
            className="mt-4 mb-3"
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
        </>
      )}

      {stage === "preview" && decrypted && (
        <>
          <div className="bg-(--card) border border-(--line) rounded-[18px] p-4 mb-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="m-0 text-[14px] font-bold tracking-[-0.15px]">
                Backup contents
              </h3>
              <StatusPill tone="ok">Valid</StatusPill>
            </div>
            <PreviewRow
              label="Created"
              value={format(
                new Date(decrypted.createdAt),
                "d MMM yyyy · h:mm a",
              )}
            />
            <PreviewRow
              label="Accounts"
              value={String(decrypted.counts.accounts)}
            />
            <PreviewRow
              label="Transactions"
              value={String(decrypted.counts.transactions)}
            />
            <PreviewRow
              label="Categories"
              value={String(decrypted.counts.categories)}
            />
            <PreviewRow
              label="Reconciliations"
              value={String(decrypted.counts.reconciliationRecords)}
            />
            <PreviewRow
              label="Imports"
              value={String(decrypted.counts.importRecords)}
              last
            />
          </div>

          {result && (
            <Alert
              tone="ok"
              className="mb-3"
              icon={
                <>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M9 12l2 2 4-4" />
                </>
              }
              title="Restore complete"
            >
              <span className="block">
                {result.added} records added
                {result.skipped > 0 ? `, ${result.skipped} skipped` : ""}.
              </span>
              <span className="block mt-1">
                Existing vault and PIN are unchanged.
              </span>
            </Alert>
          )}

          {error && (
            <div className="text-[12px] font-semibold text-(--out) mb-3 text-center">
              {error}
            </div>
          )}

          {!result && (
            <>
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
                title="Never silently overwrites"
              >
                Choose how to apply this backup. Existing records with the same
                ID are the only possible conflicts.
              </Alert>

              <div className="flex flex-col gap-2.5">
                <Button
                  variant="secondary"
                  onClick={() => handleRestore("merge")}
                  disabled={stage === "restoring"}
                >
                  Merge (skip existing)
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleRestore("replace")}
                  disabled={stage === "restoring"}
                >
                  {stage === "restoring"
                    ? "Restoring…"
                    : "Replace all (delete existing)"}
                </Button>
                <button
                  type="button"
                  onClick={reset}
                  disabled={stage === "restoring"}
                  className="text-[12px] font-semibold text-(--muted) mt-1
                             bg-transparent border-0 cursor-pointer font-[inherit]
                             disabled:opacity-40"
                >
                  Cancel
                </button>
              </div>
            </>
          )}

          {result && (
            <Button variant="secondary" onClick={reset}>
              Done
            </Button>
          )}
        </>
      )}
    </>
  );
}

function PreviewRow({ label, value, last = false }) {
  return (
    <div
      className={
        "flex items-center justify-between py-1.75 " +
        (last ? "" : "border-b border-(--line-2)")
      }
    >
      <span className="text-[11px] text-(--muted) font-semibold uppercase tracking-wider">
        {label}
      </span>
      <span className="text-[13px] font-semibold text-(--ink)">{value}</span>
    </div>
  );
}

/* ================================================================
   Tab: History
   ================================================================ */
function BackupFileRow({ entry }) {
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
          {entry.filename}
        </b>
        <small className="block text-[11px] text-(--muted) mt-0.5">
          {format(new Date(entry.createdAt), "d MMM · h:mm a")} ·{" "}
          {formatBytes(entry.sizeBytes)} · {totalRecordCount(entry.counts)}{" "}
          records
        </small>
      </div>
      <StatusPill tone="ok">Verified</StatusPill>
    </div>
  );
}

function HistoryTab({ log }) {
  if (!log || log.length === 0) {
    return (
      <div className="text-center py-10 px-4">
        <div className="w-13 h-13 rounded-2xl mx-auto mb-3 grid place-items-center bg-(--app) border border-dashed border-(--line) text-(--muted)">
          <svg
            viewBox="0 0 24 24"
            className="w-5.5 h-5.5 stroke-current fill-none stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]"
          >
            <path d="M12 15V4M8 8l4-4 4 4" />
            <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
          </svg>
        </div>
        <b className="block text-[13.5px] font-semibold mb-1.25">
          No backups yet
        </b>
        <small className="block text-[12px] text-(--muted) leading-[1.55] max-w-[34ch] mx-auto">
          Backups you create will be logged here. Files are downloaded to your
          device — keep them somewhere safe.
        </small>
      </div>
    );
  }

  return (
    <>
      <SectionLabel className="mt-0">Recent backups</SectionLabel>
      <div className="bg-(--card) border border-(--line) rounded-[18px] px-3.5 py-1.5">
        {log.map((entry, i) => (
          <div
            key={entry.id}
            className={i < log.length - 1 ? "border-b border-(--line-2)" : ""}
          >
            <BackupFileRow entry={entry} />
          </div>
        ))}
      </div>

      <Note className="mt-3">
        Backups are downloaded as files. To keep a copy off-device, move the
        downloaded file to cloud storage or another device.
      </Note>
    </>
  );
}

/* ================================================================
   Page
   ================================================================ */
export default function Backup() {
  const [tab, setTab] = useState("backup");
  const [refresh, setRefresh] = useState(0);

  const log = useLiveQuery(async () => {
    const row = await db.appSettings.get(BACKUP_LOG_KEY);
    return Array.isArray(row?.value) ? row.value : [];
  }, [refresh]);

  const handleCreated = () => setRefresh((n) => n + 1);
  const handleRestored = () => setRefresh((n) => n + 1);

  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <AppBar title="Backup & restore" />

        <SegmentedControl value={tab} options={TABS} onChange={setTab} />

        {tab === "backup" && <BackupTab onCreated={handleCreated} />}
        {tab === "restore" && <RestoreTab onRestored={handleRestored} />}
        {tab === "history" && <HistoryTab log={log} />}
      </ScrollArea>
    </PhoneFrame>
  );
}
