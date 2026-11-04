import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { AppBar } from "../../components/AppBar";
import { Button, ButtonRow } from "../../components/Button";
import { Field } from "../../components/FormField";
import { AccountPicker } from "../../components/AccountPicker";
import { Alert } from "../../components/Alert";
import { Note } from "../../components/Note";
import { BootScreen } from "../../auth/RouteGuards";
import { useAccounts } from "../../hooks/useAccounts";
import { db } from "../../db/db";
import { parseStatement, looksLikeCsv } from "../../services/importParser";
import {
  LAST_IMPORT_ACCOUNT_KEY,
  setLastImportAccountId,
} from "../../services/settings";

/* ================================================================
   Sub-views
   ================================================================ */
function EmptyState() {
  return (
    <div className="text-center py-7 px-4">
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
        Choose a statement file
      </b>
      <small className="block text-[12px] text-(--muted) leading-[1.55]">
        Supported: bKash CSV, City Bank CSV, generic CSV
      </small>
    </div>
  );
}

function FileChosenState({ fileName, parsed, onClear }) {
  return (
    <div className="bg-(--card) border border-(--line) rounded-[18px] p-4 mb-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-[10px] flex-none grid place-items-center bg-(--brand-soft) text-(--brand-dk)">
          <svg
            viewBox="0 0 24 24"
            className="w-4.5 h-4.5 stroke-current fill-none stroke-2 [stroke-linecap:round] [stroke-linejoin:round]"
          >
            <path d="M14 3v5h5" />
            <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <b className="block text-[13px] font-semibold truncate">{fileName}</b>
          <small className="block text-[11.5px] text-(--muted) mt-0.5">
            Detected format: {parsed.formatName}
          </small>
        </div>
      </div>

      <div className="h-px bg-(--line-2) my-3" />

      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <b className="block text-[15px] font-bold num">
            {parsed.summary.parsed}
          </b>
          <small className="block text-[10px] text-(--muted) uppercase tracking-wider font-semibold mt-0.5">
            Parsed
          </small>
        </div>
        <div>
          <b className="block text-[15px] font-bold num text-(--warn)">
            {parsed.summary.flagged}
          </b>
          <small className="block text-[10px] text-(--muted) uppercase tracking-wider font-semibold mt-0.5">
            Flagged
          </small>
        </div>
        <div>
          <b className="block text-[15px] font-bold num text-(--out)">
            {parsed.summary.invalid}
          </b>
          <small className="block text-[10px] text-(--muted) uppercase tracking-wider font-semibold mt-0.5">
            Invalid
          </small>
        </div>
      </div>

      <button
        type="button"
        onClick={onClear}
        className="mt-3 text-[12px] font-semibold text-(--muted)
                   bg-transparent border-0 cursor-pointer font-[inherit] w-full"
      >
        Choose a different file
      </button>
    </div>
  );
}

/* ================================================================
   Inner form — mounts once accounts + saved account are ready
   ================================================================ */
function ImportForm({ accounts, defaultAccountId }) {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [accountId, setAccountId] = useState(() => {
    if (defaultAccountId && accounts.some((a) => a.id === defaultAccountId)) {
      return defaultAccountId;
    }
    return accounts[0]?.id ?? "";
  });
  const [file, setFile] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState("");

  const resetParse = () => {
    setFile(null);
    setParsed(null);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleAccountChange = (newId) => {
    setAccountId(newId);
    // Duplicate detection is per-account — switching accounts
    // invalidates the current parse. Force a re-parse.
    if (parsed) resetParse();
    // Persist so next import defaults here (the bug that made
    // duplicate detection look broken on second import).
    setLastImportAccountId(newId).catch((err) =>
      console.warn("Could not persist import account:", err),
    );
  };

  const handleChoose = async (e) => {
    setError("");
    const picked = e.target.files?.[0];
    if (!picked) return;

    if (!looksLikeCsv(picked)) {
      setError("Only .csv files are supported.");
      return;
    }

    setFile(picked);
    setParsing(true);
    try {
      const result = await parseStatement({
        file: picked,
        accountId,
      });
      setParsed(result);
    } catch (err) {
      const map = {
        NO_FILE: "Choose a file first.",
        FILE_TOO_LARGE: "File is too large (max 10 MB).",
        EMPTY_FILE: "This file has no data.",
        UNSUPPORTED_FORMAT: "This file format isn't supported yet.",
      };
      setError(map[err.message] ?? "Could not parse the file.");
      setFile(null);
      setParsed(null);
    } finally {
      setParsing(false);
    }
  };

  const handleContinue = () => {
    if (!parsed) return;
    navigate("/import/review", { state: parsed });
  };

  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <AppBar title="Import statement" />

        <div className="stagger">
        {!file ? (
          <EmptyState />
        ) : (
          parsed && (
            <FileChosenState
              fileName={parsed.fileName}
              parsed={parsed}
              onClear={resetParse}
            />
          )
        )}

        <input
          ref={fileRef}
          type="file"
          accept=".csv,.txt,text/csv"
          onChange={handleChoose}
          className="hidden"
        />

        {!file && (
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            Choose file
          </Button>
        )}

        {error && (
          <div className="text-[12px] font-semibold text-(--out) mt-3 text-center">
            {error}
          </div>
        )}

        {parsing && (
          <div className="text-[12px] font-semibold text-(--muted) mt-3 text-center">
            Parsing…
          </div>
        )}

        <div className="mt-4">
          <Field label="Destination account">
            <AccountPicker
              accounts={accounts}
              value={accountId}
              onChange={handleAccountChange}
            />
          </Field>
        </div>

        <Alert
          tone="info"
          icon={
            <>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4M12 16h.01" />
            </>
          }
          title="Parsed on your device"
        >
          Files are never uploaded. Your statement stays on this phone.
        </Alert>

        <Note>
          Balances do not change during parsing. You will review every parsed
          row before anything is saved. The destination account is remembered
          for next time.
        </Note>
      </div>
      </ScrollArea>

      <div
        className="flex-none px-4.5 pt-3 pb-[calc(20px+env(safe-area-inset-bottom))] md:pb-5"
        style={{
          background:
            "linear-gradient(180deg, rgba(247,249,248,0) 0%, var(--app) 34%)",
        }}
      >
        <ButtonRow>
          <Button
            variant="secondary"
            className="flex-[0_0_34%]"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button onClick={handleContinue} disabled={!parsed || parsing}>
            Parse &amp; continue
          </Button>
        </ButtonRow>
      </div>
    </PhoneFrame>
  );
}

/* ================================================================
   Outer — loading + empty-accounts guard + saved-account read
   ================================================================ */
export default function ImportStatement() {
  const navigate = useNavigate();
  const { accounts, loading: accLoading } = useAccounts();

  // undefined = still loading, null = no saved value, string = saved id
  const lastAccountId = useLiveQuery(async () => {
    const row = await db.appSettings.get(LAST_IMPORT_ACCOUNT_KEY);
    return row?.value ?? null;
  }, []);

  if (accLoading || lastAccountId === undefined) return <BootScreen />;

  const activeAccounts = accounts.filter((a) => !a.isArchived);

  if (activeAccounts.length === 0) {
    return (
      <PhoneFrame>
        <StatusBar />
        <ScrollArea>
          <AppBar title="Import statement" />
          <div className="text-center py-10 px-4">
            <b className="block text-[13.5px] font-semibold mb-2">
              Create an account first
            </b>
            <small className="block text-[12px] text-(--muted) mb-4 leading-[1.55]">
              Imported transactions land in an account. Add one, then come back.
            </small>
            <Button onClick={() => navigate("/accounts/new")}>
              + Add account
            </Button>
          </div>
        </ScrollArea>
      </PhoneFrame>
    );
  }

  return (
    <ImportForm accounts={activeAccounts} defaultAccountId={lastAccountId} />
  );
}
