import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { IconButton } from "../../components/IconButton";
import { BottomNav } from "../../components/BottomNav";
import { SegmentedControl } from "../../components/SegmentedControl";
import { StatusPill } from "../../components/StatusPill";

/* ----------------------------------------------------------------
   Net cash flow hero card
   ---------------------------------------------------------------- */
function NetCashFlowCard() {
  return (
    <div
      className="bg-white border border-(--line) rounded-[18px] p-4
                    shadow-[0_1px_2px_rgba(14,26,22,0.06)]"
    >
      <div className="text-[11.5px] font-bold tracking-[0.06em] uppercase text-(--muted)">
        Net cash flow
      </div>
      <div className="num text-[30px] font-bold tracking-[-1.1px] text-(--in) mt-1.5">
        +৳36,660.00
      </div>
      <div className="h-px bg-(--line-2) my-3.5" />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-[11px] text-(--muted) font-semibold">
            Income
          </div>
          <div className="num text-[15px] font-bold text-(--in) mt-0.75">
            ৳58,000.00
          </div>
        </div>
        <div>
          <div className="text-[11px] text-(--muted) font-semibold">
            Expenses
          </div>
          <div className="num text-[15px] font-bold text-(--out) mt-0.75">
            ৳21,340.00
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
   Spending trend — weekly expense bars
   ---------------------------------------------------------------- */
const TREND = [
  { label: "W1", height: 44 },
  { label: "W2", height: 62 },
  { label: "W3", height: 38 },
  { label: "W4", height: 76 },
];

function SpendingTrendCard() {
  return (
    <div
      className="bg-white border border-(--line) rounded-[18px] p-4 mt-3
                    shadow-[0_1px_2px_rgba(14,26,22,0.06)]"
    >
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="m-0 text-[14px] font-bold tracking-[-0.15px]">
          Spending trend
        </h3>
        <StatusPill tone="neutral">4 weeks</StatusPill>
      </div>

      <div className="flex items-end gap-2.5 h-22">
        {TREND.map((w) => (
          <div
            key={w.label}
            className="flex-1 flex items-end justify-center h-full"
          >
            <span
              className="block w-2.25 rounded-t-sm rounded-b-xs min-h-1"
              style={{
                height: `${w.height}%`,
                background: "linear-gradient(180deg,#E2705F,#C8402F)",
                opacity: 0.85,
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2.5 mt-2.5">
        {TREND.map((w) => (
          <div
            key={w.label}
            className="flex-1 text-center text-[10px] text-(--muted) font-semibold"
          >
            {w.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
   By category — same 4 rows as Dashboard
   ---------------------------------------------------------------- */
const CATEGORIES = [
  { name: "Groceries", amount: "৳8,450", width: 76, color: "#0E7C5A" },
  { name: "Rent", amount: "৳6,000", width: 54, color: "#2E9C7A" },
  { name: "Transport", amount: "৳3,290", width: 29, color: "#61B79B" },
  { name: "Utilities", amount: "৳2,400", width: 21, color: "#9CD2C1" },
];

function ByCategoryCard() {
  return (
    <div
      className="bg-white border border-(--line) rounded-[18px] p-4 mt-3
                    shadow-[0_1px_2px_rgba(14,26,22,0.06)]"
    >
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="m-0 text-[14px] font-bold tracking-[-0.15px]">
          By category
        </h3>
        <a
          href="#"
          className="text-[12px] font-semibold text-(--brand) no-underline"
        >
          Detail
        </a>
      </div>

      <div className="space-y-3.25">
        {CATEGORIES.map((c) => (
          <div key={c.name}>
            <div className="flex justify-between items-baseline text-[12.5px] mb-1.5">
              <b className="font-semibold text-(--ink)">{c.name}</b>
              <span className="font-bold num text-(--ink-2)">
                {c.amount}
              </span>
            </div>
            <div className="h-1.75 rounded-full bg-(--line-2) overflow-hidden">
              <i
                className="block h-full rounded-full"
                style={{ width: `${c.width}%`, background: c.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
   Account balances card
   ---------------------------------------------------------------- */
const ACCOUNTS = [
  { name: "City Bank — Savings", type: "Bank", amount: "৳91,600.00" },
  { name: "bKash", type: "Mobile wallet", amount: "৳24,650.00" },
  { name: "Cash", type: "Cash", amount: "৳8,250.00" },
];

function AccountBalanceRow({ name, type, amount, last }) {
  return (
    <div
      className={
        "flex items-center gap-3 py-2.25 " +
        (last ? "" : "border-b border-(--line-2)")
      }
    >
      <div className="flex-1 min-w-0">
        <b className="block text-[13.5px] font-semibold tracking-[-0.1px] truncate">
          {name}
        </b>
        <small className="block text-[11.5px] text-(--muted) mt-0.5">
          {type}
        </small>
      </div>
      <div className="text-[13.5px] font-bold num text-(--ink) whitespace-nowrap tracking-[-0.2px]">
        {amount}
      </div>
    </div>
  );
}

function AccountBalancesCard() {
  return (
    <div
      className="bg-white border border-(--line) rounded-[18px] p-4 mt-3
                    shadow-[0_1px_2px_rgba(14,26,22,0.06)]"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="m-0 text-[14px] font-bold tracking-[-0.15px]">
          Account balances
        </h3>
      </div>

      <div>
        {ACCOUNTS.map((a, i) => (
          <AccountBalanceRow
            key={a.name}
            name={a.name}
            type={a.type}
            amount={a.amount}
            last={i === ACCOUNTS.length - 1}
          />
        ))}
      </div>

      <div
        className="text-[11.5px] leading-[1.6] text-(--muted)
                   bg-(--app) border border-dashed border-(--line)
                   rounded-[14px] px-3.25 py-2.75 mt-2.5"
      >
        Transfers are excluded from income and expense totals.
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
   Page
   ---------------------------------------------------------------- */
export default function Reports() {
  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <div className="flex items-center justify-between gap-3 py-1.5 pb-3.5">
          <div>
            <h2 className="m-0 text-[23px] font-bold tracking-[-0.5px] leading-tight">
              Reports
            </h2>
            <div className="text-[12.5px] text-(--muted) mt-0.75">
              October 2026
            </div>
          </div>
          <IconButton
            label="Pick period"
            icon={
              <>
                <rect x="3" y="5" width="18" height="16" rx="3" />
                <path d="M3 10h18M8 3v4M16 3v4" />
              </>
            }
          />
        </div>

        <SegmentedControl
          value="month"
          options={[
            { value: "day", label: "Day" },
            { value: "week", label: "Week" },
            { value: "month", label: "Month" },
          ]}
        />

        <NetCashFlowCard />
        <SpendingTrendCard />
        <ByCategoryCard />
        <AccountBalancesCard />
      </ScrollArea>
      <BottomNav active="reports" />
    </PhoneFrame>
  );
}
