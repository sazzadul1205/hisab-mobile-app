import { useNavigate, useParams } from "react-router-dom";
import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { AppBar } from "../../components/AppBar";
import { IconButton } from "../../components/IconButton";
import { StatusPill } from "../../components/StatusPill";
import { Button } from "../../components/Button";
import { Note } from "../../components/Note";

// Demo data — replaced by a store lookup on :id when the DB wires in.
const DEMO = {
  type: "transfer",
  amount: "৳5,000.00",
  date: "29 Oct 2026 · 9:30 AM",
  from: "City Bank — Savings",
  to: "bKash",
  fee: "৳25.00", // set to null to hide the fee rows
  totalDebit: "৳5,025.00",
  note: "Moving to bKash for online payments",
  createdAt: "29 Oct · 9:30 AM",
  updatedAt: "29 Oct · 9:30 AM",
};

const HERO = {
  transfer: {
    tone: "tr",
    label: "Transfer",
    bg: "bg-[var(--tr-soft)]",
    fg: "text-[var(--tr)]",
  },
  income: {
    tone: "in",
    label: "Income",
    bg: "bg-[var(--in-soft)]",
    fg: "text-[var(--in)]",
  },
  expense: {
    tone: "out",
    label: "Expense",
    bg: "bg-[var(--out-soft)]",
    fg: "text-[var(--out)]",
  },
};

export default function TransactionDetail() {
  // Reserved for the real data lookup

  const { id } = useParams();
  const navigate = useNavigate();
  const meta = HERO[DEMO.type] ?? HERO.transfer;
  const hasFee = DEMO.fee != null && DEMO.fee !== "";

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
        <div
          className="bg-white border border-(--line) rounded-[18px]
                        shadow-[0_1px_2px_rgba(14,26,22,0.06)]
                        text-center p-5.5 px-4"
        >
          <div
            className={`w-13 h-13 rounded-2xl mx-auto mb-3
                        grid place-items-center ${meta.bg} ${meta.fg}`}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6 stroke-current fill-none stroke-2
                         [stroke-linecap:round] [stroke-linejoin:round]"
            >
              <path d="M4 8h13l-3-3M20 16H7l3 3" />
            </svg>
          </div>
          <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
          <div className="text-[28px] font-bold tracking-[-0.8px] num mt-2.5">
            {DEMO.amount}
          </div>
          <div className="text-[12px] text-(--muted) mt-1">{DEMO.date}</div>
        </div>

        {/* Details */}
        <div
          className="bg-white border border-(--line) rounded-[18px]
                        shadow-[0_1px_2px_rgba(14,26,22,0.06)] p-4 mt-3"
        >
          <div className="grid grid-cols-2 gap-3 text-[12.5px]">
            <div>
              <div className="text-[11px] text-(--muted) font-semibold uppercase tracking-wider">
                From
              </div>
              <div className="font-bold mt-1">{DEMO.from}</div>
            </div>
            <div>
              <div className="text-[11px] text-(--muted) font-semibold uppercase tracking-wider">
                To
              </div>
              <div className="font-bold mt-1">{DEMO.to}</div>
            </div>
          </div>

          {hasFee && (
            <>
              <div className="h-px bg-(--line-2) my-3.5" />
              <div className="grid grid-cols-2 gap-3 text-[12.5px]">
                <div>
                  <div className="text-[11px] text-(--muted) font-semibold uppercase tracking-wider">
                    Fee
                  </div>
                  <div className="font-bold num text-(--out) mt-1">
                    {DEMO.fee}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-(--muted) font-semibold uppercase tracking-wider">
                    Total debit
                  </div>
                  <div className="font-bold num mt-1">{DEMO.totalDebit}</div>
                </div>
              </div>
            </>
          )}

          <div className="h-px bg-(--line-2) my-3.5" />
          <div className="text-[12.5px] leading-[1.6]">
            <span className="text-(--muted)">Note:</span> {DEMO.note}
          </div>

          <div className="h-px bg-(--line-2) my-3.5" />
          <div className="grid grid-cols-2 gap-3 text-[11.5px] text-(--muted)">
            <div>Created: {DEMO.createdAt}</div>
            <div>Updated: {DEMO.updatedAt}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2.5 mt-3">
          <Button variant="secondary">Delete</Button>
          <Button>Edit</Button>
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
