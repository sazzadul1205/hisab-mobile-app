import { useParams, useNavigate } from "react-router-dom";
import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { AppBar } from "../../components/AppBar";
import { IconButton } from "../../components/IconButton";
import { StatusPill } from "../../components/StatusPill";
import { Button } from "../../components/Button";
import { Note } from "../../components/Note";
import { getDemoTransaction } from "../../data/demoTransactions";

const HERO_META = {
  transfer: {
    tone: "tr",
    label: "Transfer",
    bg: "bg-(--tr-soft)",
    fg: "text-(--tr)",
    icon: <path d="M4 8h13l-3-3M20 16H7l3 3" />,
    amountPrefix: "",
    amountClass: "text-(--ink)",
  },
  income: {
    tone: "in",
    label: "Income",
    bg: "bg-(--in-soft)",
    fg: "text-(--in)",
    icon: <path d="M12 4v16M8 8h6a3 3 0 0 1 0 6H8" />,
    amountPrefix: "+",
    amountClass: "text-(--in)",
  },
  expense: {
    tone: "out",
    label: "Expense",
    bg: "bg-(--out-soft)",
    fg: "text-(--out)",
    icon: (
      <>
        <path d="M5 12h14" />
        <circle cx="12" cy="12" r="9" />
      </>
    ),
    amountPrefix: "−",
    amountClass: "text-(--out)",
  },
};

function DetailField({ label, value, valueClass = "" }) {
  return (
    <div>
      <div className="text-[11px] text-(--muted) font-semibold uppercase tracking-wider">
        {label}
      </div>
      <div className={`font-bold mt-1 ${valueClass}`}>{value}</div>
    </div>
  );
}

export default function TransactionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const tx = getDemoTransaction(id);
  const meta = HERO_META[tx.type] ?? HERO_META.transfer;
  const hasFee = tx.fee != null && tx.fee !== "";

  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <AppBar
          title="Transaction"
          right={
            <IconButton
              label="Edit"
              icon={
                <>
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                </>
              }
              onClick={() => navigate(`/transactions/${id}/edit`)}
            />
          }
        />

        {/* Hero */}
        <div className="bg-white border border-(--line) rounded-[18px] shadow-[0_1px_2px_rgba(14,26,22,0.06)] text-center p-5.5 px-4">
          <div
            className={`w-13 h-13 rounded-2xl mx-auto mb-3 grid place-items-center ${meta.bg} ${meta.fg}`}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6 stroke-current fill-none stroke-2 [stroke-linecap:round] [stroke-linejoin:round]"
            >
              {meta.icon}
            </svg>
          </div>
          <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
          <div
            className={`text-[28px] font-bold tracking-[-0.8px] num mt-2.5 ${meta.amountClass}`}
          >
            {meta.amountPrefix}
            {tx.amount}
          </div>
          <div className="text-[12px] text-(--muted) mt-1">{tx.date}</div>
        </div>

        {/* Details */}
        <div className="bg-white border border-(--line) rounded-[18px] shadow-[0_1px_2px_rgba(14,26,22,0.06)] p-4 mt-3">
          {tx.type === "transfer" ? (
            <>
              <div className="grid grid-cols-2 gap-3 text-[12.5px]">
                <DetailField label="From" value={tx.from} />
                <DetailField label="To" value={tx.to} />
              </div>

              {hasFee && (
                <>
                  <div className="h-px bg-(--line-2) my-3.5" />
                  <div className="grid grid-cols-2 gap-3 text-[12.5px]">
                    <DetailField
                      label="Fee"
                      value={tx.fee}
                      valueClass="text-(--out) num"
                    />
                    <DetailField
                      label="Total debit"
                      value={tx.totalDebit}
                      valueClass="num"
                    />
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3 text-[12.5px]">
              <DetailField
                label={tx.type === "income" ? "To" : "From"}
                value={tx.type === "income" ? tx.to : tx.from}
              />
              <DetailField label="Category" value={tx.category} />
            </div>
          )}

          <div className="h-px bg-(--line-2) my-3.5" />
          <div className="text-[12.5px] leading-[1.6]">
            <span className="text-(--muted)">Note:</span>{" "}
            {tx.note || <span className="text-(--muted)">—</span>}
          </div>

          <div className="h-px bg-(--line-2) my-3.5" />
          <div className="grid grid-cols-2 gap-3 text-[11.5px] text-(--muted)">
            <div>Created: {tx.createdAt}</div>
            <div>Updated: {tx.updatedAt}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2.5 mt-3">
          <Button variant="secondary">Delete</Button>
          <Button onClick={() => navigate(`/transactions/${id}/edit`)}>
            Edit
          </Button>
        </div>

        <Note>
          Deletion asks for confirmation and updates all account balances and
          reports. Transfers show both source and destination accounts, plus any
          fee.
        </Note>
      </ScrollArea>
    </PhoneFrame>
  );
}
