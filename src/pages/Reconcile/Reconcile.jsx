import { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { AppBar } from "../../components/AppBar";
import { Field, TextInput, MoneyInput } from "../../components/FormField";
import { AccountSelect } from "../../components/AccountSelect";
import { Alert } from "../../components/Alert";
import { Button } from "../../components/Button";
import { useAccount } from "../../hooks/useAccounts";
import { saveReconciliation } from "../../services/reconciliations";
import { formatBDT, parseMoney } from "../../lib/money";

const TYPE_COLOR = {
  cash: "#0E7C5A",
  wallet: "#D6336C",
  bank: "#3355C4",
  other: "#7C8B85",
};

function initials(name) {
  const cleaned = (name ?? "").trim();
  if (!cleaned) return "?";
  if (cleaned.length <= 2) return cleaned.toUpperCase();
  return cleaned[0].toUpperCase();
}

function ReconPanel({ calculated, actual }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 mb-3">
      <div className="bg-white border border-(--line) rounded-[14px] p-3">
        <small className="block text-[10.5px] text-(--muted) font-semibold uppercase tracking-wider">
          Calculated
        </small>
        <b className="block text-[17px] font-bold tracking-[-0.4px] num mt-1.25 text-(--ink)">
          {calculated}
        </b>
      </div>
      <div className="bg-white border border-(--line) rounded-[14px] p-3">
        <small className="block text-[10.5px] text-(--muted) font-semibold uppercase tracking-wider">
          Actual (you enter)
        </small>
        <b className="block text-[17px] font-bold tracking-[-0.4px] num mt-1.25 text-(--brand)">
          {actual || "—"}
        </b>
      </div>
    </div>
  );
}

function DiffTile({ value }) {
  return (
    <div
      className="rounded-[14px] p-3.5 text-center mb-3"
      style={{ background: "var(--warn-soft)", border: "1px solid #F0DDB8" }}
    >
      <small className="block text-[11px] text-(--warn) font-bold uppercase tracking-[0.06em]">
        Difference
      </small>
      <b className="block text-[24px] font-bold tracking-[-0.6px] num text-(--warn) mt-1">
        {value}
      </b>
    </div>
  );
}

export default function Reconcile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { account, balance, loading } = useAccount(id);
  const noteRef = useRef(null);
  const actualRef = useRef(null);

  const [actualPaisa, setActualPaisa] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (loading || !account) {
    return (
      <PhoneFrame>
        <StatusBar />
        <ScrollArea>
          <AppBar title="Reconcile" />
          <div className="text-center py-10">
            <small className="text-(--muted)">Loading…</small>
          </div>
        </ScrollArea>
      </PhoneFrame>
    );
  }

  const diff = actualPaisa != null ? actualPaisa - balance : 0;

  const handleActualChange = (e) => {
    const paisa = parseMoney(e.target.value);
    setActualPaisa(paisa);
    setError("");
  };

  const handleSave = async () => {
    setError("");
    if (actualPaisa == null || actualPaisa < 0) {
      setError("Enter a valid actual balance.");
      return;
    }
    setSaving(true);
    try {
      await saveReconciliation({
        accountId: id,
        recordedBalance: balance,
        actualBalance: actualPaisa,
        note: noteRef.current?.value ?? "",
      });
      navigate(`/accounts/${id}`, { replace: true });
    } catch (err) {
      console.error("Reconcile failed:", err);
      setError("Could not save. Try again.");
      setSaving(false);
    }
  };

  const typeColor = TYPE_COLOR[account.type] ?? "#7C8B85";

  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <AppBar title="Reconcile" />

        <Field label="Account">
          <AccountSelect
            initial={initials(account.name)}
            color={typeColor}
            name={account.name}
          />
        </Field>

        <ReconPanel
          calculated={formatBDT(balance)}
          actual={actualPaisa != null ? formatBDT(actualPaisa) : ""}
        />
        {actualPaisa != null && (
          <DiffTile value={`${diff >= 0 ? "+" : ""}${formatBDT(diff)}`} />
        )}

        <Field label="Actual balance">
          <MoneyInput inputRef={actualRef} onChange={handleActualChange} />
        </Field>

        <Field label="Note" hint="optional">
          <TextInput
            inputRef={noteRef}
            placeholder="e.g. unrecorded purchase"
          />
        </Field>

        {error && (
          <div className="text-[12px] font-semibold text-(--out) mb-3 text-center">
            {error}
          </div>
        )}

        <Alert
          tone="warn"
          icon={
            <>
              <path d="M12 9v4" />
              <circle cx="12" cy="17" r=".6" fill="currentColor" />
              <path d="M10.3 3.9 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
            </>
          }
          title="Reconciliation records a snapshot"
        >
          No transaction is added or edited. Difference is stored for later
          reference only.
        </Alert>
      </ScrollArea>

      <div
        className="flex-none px-4.5 pt-3 pb-[calc(20px+env(safe-area-inset-bottom))] md:pb-5"
        style={{
          background:
            "linear-gradient(180deg, rgba(247,249,248,0) 0%, var(--app) 34%)",
        }}
      >
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save reconciliation"}
        </Button>
      </div>
    </PhoneFrame>
  );
}
