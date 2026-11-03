import { useNavigate, useParams } from "react-router-dom";
import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { AppBar } from "../../components/AppBar";
import { Alert } from "../../components/Alert";
import { Button, ButtonRow } from "../../components/Button";
import { Note } from "../../components/Note";

// Demo data — replaced by a store lookup on :id when the DB wires in
const DEMO = {
  name: "City Bank — Savings",
  type: "Bank account",
  balance: "৳91,600.00",
  transactionCount: 12,
};

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
      <span className="text-[13px] font-semibold text-(--ink)">
        {value}
      </span>
    </div>
  );
}

export default function ArchiveAccount() {
  const navigate = useNavigate();
  const { id } = useParams();
  const cancel = () => navigate(`/accounts/${id}`);

  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <AppBar title="Archive account" />

        {/* Warn badge */}
        <div className="w-16 h-16 rounded-[22px] mx-auto mt-3 mb-4.5 grid place-items-center bg-(--warn-soft) text-(--warn)">
          <svg
            viewBox="0 0 24 24"
            className="w-7.5 h-7.5 stroke-current fill-none stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]"
          >
            <rect x="3" y="4" width="18" height="5" rx="1.5" />
            <path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9" />
            <path d="M10 13h4" />
          </svg>
        </div>

        {/* Copy */}
        <div className="text-center mb-5">
          <h2 className="m-0 mb-2 text-[20px] font-bold tracking-[-0.4px]">
            Archive this account?
          </h2>
          <p className="m-0 mx-auto text-[13px] text-(--muted) leading-[1.6] max-w-[32ch]">
            Hidden from your active list. All history is preserved.
          </p>
        </div>

        {/* Detail card */}
        <div className="bg-white border border-(--line) rounded-[18px] p-4 mb-3">
          <InfoRow label="Account" value={DEMO.name} />
          <InfoRow label="Type" value={DEMO.type} />
          <InfoRow label="Balance" value={DEMO.balance} />
          <InfoRow label="Transactions" value={DEMO.transactionCount} last />
        </div>

        <Alert
          tone="info"
          className="mb-3"
          icon={
            <>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4M12 16h.01" />
            </>
          }
          title="You can undo this"
        >
          Archived accounts can be restored at any time from the Archived
          section.
        </Alert>

        <Note>
          Archived accounts are excluded from the combined balance and from new
          transactions, but historical reports and records remain intact.
        </Note>
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
          >
            Cancel
          </Button>
          <Button>Archive account</Button>
        </ButtonRow>
      </div>
    </PhoneFrame>
  );
}
