import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { AppBar } from "../../components/AppBar";
import { Alert } from "../../components/Alert";
import { Button, ButtonRow } from "../../components/Button";
import { Note } from "../../components/Note";
import { useAccount } from "../../hooks/useAccounts";
import { setArchived } from "../../services/accounts";
import { formatBDT } from "../../lib/money";
import { logger } from "../../lib/logger";

function InfoRow({ label, value, last = false }) {
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

export default function ArchiveAccount() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { account, balance, transactions, loading } = useAccount(id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const cancel = () => navigate(`/accounts/${id}`);

  if (loading || !account) {
    return (
      <PhoneFrame>
        <StatusBar />
        <ScrollArea>
          <AppBar title="Archive account" />
          <div className="text-center py-10">
            <small className="text-(--muted)">Loading…</small>
          </div>
        </ScrollArea>
      </PhoneFrame>
    );
  }

  const isAlreadyArchived = account.isArchived;
  const action = isAlreadyArchived ? "Unarchive" : "Archive";

  const handleSave = async () => {
    setError("");
    setSaving(true);
    try {
      await setArchived(id, !isAlreadyArchived);
      navigate(`/accounts/${id}`, { replace: true });
    } catch (err) {
      logger.error("Archive failed:", err);
      setError("Could not update. Try again.");
      setSaving(false);
    }
  };

  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <AppBar title={`${action} account`} />

        <div className="stagger">
        <div
          className={`w-16 h-16 rounded-[22px] mx-auto mt-3 mb-4.5 grid place-items-center ${
            isAlreadyArchived
              ? "bg-(--brand-soft) text-(--brand-dk)"
              : "bg-(--warn-soft) text-(--warn)"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            className="w-7.5 h-7.5 stroke-current fill-none stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]"
          >
            <rect x="3" y="4" width="18" height="5" rx="1.5" />
            <path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9" />
            <path d="M10 13h4" />
          </svg>
        </div>

        <div className="text-center mb-5">
          <h2 className="m-0 mb-2 text-[20px] font-bold tracking-[-0.4px]">
            {isAlreadyArchived
              ? "Restore this account?"
              : "Archive this account?"}
          </h2>
          <p className="m-0 mx-auto text-[13px] text-(--muted) leading-[1.6] max-w-[32ch]">
            {isAlreadyArchived
              ? "The account will appear in your active list again."
              : "Hidden from your active list. All history is preserved."}
          </p>
        </div>

        <div className="bg-(--card) border border-(--line) rounded-[18px] p-4 mb-3">
          <InfoRow label="Account" value={account.name} />
          <InfoRow label="Balance" value={formatBDT(balance)} />
          <InfoRow
            label="Transactions"
            value={String(transactions.length)}
            last
          />
        </div>

        {error && (
          <div className="text-[12px] font-semibold text-(--out) mb-3 text-center">
            {error}
          </div>
        )}

        <Alert
          tone="info"
          className="mb-3"
          icon={
            <>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4M12 16h.01" />
            </>
          }
          title={isAlreadyArchived ? "Reversible" : "You can undo this"}
        >
          {isAlreadyArchived
            ? "Un-archiving does not modify any transactions or balances."
            : "Archived accounts can be restored at any time from the Archived section."}
        </Alert>

        <Note>
          Archived accounts are excluded from the combined balance and from new
          transactions, but historical reports and records remain intact.
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
            onClick={cancel}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Updating…" : `${action} account`}
          </Button>
        </ButtonRow>
      </div>
    </PhoneFrame>
  );
}
