import { Link, useNavigate } from "react-router-dom";
import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { IconButton } from "../../components/IconButton";
import { BottomNav } from "../../components/BottomNav";
import { TransactionRow } from "../../components/TransactionRow";

function BalanceCard() {
  return (
    <div
      className="rounded-3xl p-5 text-white"
      style={{
        background:
          "radial-gradient(120% 120% at 100% 0%, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 55%), linear-gradient(150deg, #118A64 0%, #0A5A41 100%)",
        boxShadow: "0 18px 34px -18px rgba(10,90,65,0.75)",
      }}
    >
      <div className="text-[12px] font-semibold tracking-[0.06em] uppercase text-white/70">
        Combined balance
      </div>
      <div className="text-[34px] font-bold tracking-[-1.2px] mt-1.5 mb-0.5 num">
        ৳1,24,500
        <span className="text-[20px] font-semibold opacity-70 tracking-[-0.4px]">
          .00
        </span>
      </div>
      <div className="text-[12px] text-white/65">3 active accounts · BDT</div>

      <div
        className="grid grid-cols-3 gap-2 mt-4.5 pt-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.16)" }}
      >
        <Stat label="Income today" value="৳2,000" />
        <Stat label="Expenses today" value="৳1,970" />
        <Stat label="Net flow" value="+৳30" />
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="text-[11px] text-white/70 leading-normal">
      {label}
      <b className="block text-[14px] font-bold text-white num tracking-[-0.2px] mt-0.5">
        {value}
      </b>
    </div>
  );
}

const ACTIONS = [
  {
    label: "Income",
    tone: "in",
    to: "/income/new",
    icon: <path d="M12 5v14M5 12h14" />,
  },
  {
    label: "Expense",
    tone: "out",
    to: "/expense/new",
    icon: <path d="M5 12h14" />,
  },
  {
    label: "Transfer",
    tone: "tr",
    to: "/transfer/new",
    icon: <path d="M4 8h13l-3-3M20 16H7l3 3" />,
  },
  {
    label: "Import",
    tone: "im",
    to: "/import",
    icon: (
      <>
        <path d="M12 15V4M8 8l4-4 4 4" />
        <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
      </>
    ),
  },
];

const TONE_STYLES = {
  in: "bg-[var(--brand-soft)] text-[var(--in)]",
  out: "bg-[var(--danger-soft)] text-[var(--out)]",
  tr: "bg-[var(--tr-soft)] text-[var(--tr)]",
  im: "bg-[var(--warn-soft)] text-[var(--warn)]",
};

function QuickActions() {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-4 gap-2 mt-3">
      {ACTIONS.map((a) => (
        <button
          key={a.label}
          onClick={a.to ? () => navigate(a.to) : undefined}
          className="flex flex-col items-center gap-1.75 pt-3.25 pb-2.75 px-1
                     bg-white border border-(--line) rounded-[14px]
                     text-[10.5px] font-semibold text-(--ink-2)
                     cursor-pointer font-[inherit]"
        >
          <span
            className={`w-8 h-8 rounded-[10px] grid place-items-center ${TONE_STYLES[a.tone]}`}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 stroke-current fill-none stroke-2
                         [stroke-linecap:round] [stroke-linejoin:round]"
            >
              {a.icon}
            </svg>
          </span>
          {a.label}
        </button>
      ))}
    </div>
  );
}

const WEEK_DATA = [
  { day: "Fri", in: 42, out: 30 },
  { day: "Sat", in: 20, out: 52 },
  { day: "Sun", in: 66, out: 24 },
  { day: "Mon", in: 34, out: 44 },
  { day: "Tue", in: 52, out: 18 },
  { day: "Wed", in: 26, out: 60 },
  { day: "Thu", in: 78, out: 36 },
];

function WeeklyChart() {
  return (
    <div className="bg-white border border-(--line) rounded-[18px] p-4 mt-3 shadow-[0_1px_2px_rgba(14,26,22,0.06)]">
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="m-0 text-[14px] font-bold tracking-[-0.15px]">
          This week
        </h3>
        <Link
          to="/reports"
          className="text-[12px] font-semibold text-(--brand) no-underline"
        >
          Reports
        </Link>
      </div>

      <div className="flex items-end gap-2.5 h-26 pt-1.5">
        {WEEK_DATA.map((d) => (
          <div
            key={d.day}
            className="flex-1 flex items-end justify-center gap-0.75 h-full"
          >
            <span
              className="block w-2.25 rounded-t-sm rounded-b-xs min-h-1"
              style={{
                height: `${d.in}%`,
                background: "linear-gradient(180deg,#18A577,#0E7C5A)",
              }}
            />
            <span
              className="block w-2.25 rounded-t-sm rounded-b-xs min-h-1"
              style={{
                height: `${d.out}%`,
                background: "linear-gradient(180deg,#E2705F,#C8402F)",
                opacity: 0.85,
              }}
            />
          </div>
        ))}
      </div>

      <div className="flex gap-2.5 mt-2.5">
        {WEEK_DATA.map((d) => (
          <div
            key={d.day}
            className="flex-1 text-center text-[10px] text-(--muted) font-semibold"
          >
            {d.day}
          </div>
        ))}
      </div>

      <div
        className="flex gap-3.5 mt-3 pt-3 border-t border-(--line-2)
                      text-[11px] text-(--muted) font-semibold"
      >
        <span className="flex items-center gap-1.5">
          <i
            className="w-2 h-2 rounded-[3px] inline-block"
            style={{ background: "var(--in)" }}
          />
          Income ৳58,000
        </span>
        <span className="flex items-center gap-1.5">
          <i
            className="w-2 h-2 rounded-[3px] inline-block"
            style={{ background: "var(--out)" }}
          />
          Expense ৳21,340
        </span>
      </div>
    </div>
  );
}

const CATEGORIES = [
  { name: "Groceries", amount: "৳8,450", width: 76, color: "#0E7C5A" },
  { name: "Rent", amount: "৳6,000", width: 54, color: "#2E9C7A" },
  { name: "Transport", amount: "৳3,290", width: 29, color: "#61B79B" },
  { name: "Utilities", amount: "৳2,400", width: 21, color: "#9CD2C1" },
];

function CategoryBreakdown() {
  return (
    <div className="bg-white border border-(--line) rounded-[18px] p-4 mt-3 shadow-[0_1px_2px_rgba(14,26,22,0.06)]">
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="m-0 text-[14px] font-bold tracking-[-0.15px]">
          Expense breakdown
        </h3>
        <a
          href="#"
          className="text-[12px] font-semibold text-(--brand) no-underline"
        >
          All
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

const RECENT = [
  {
    id: 1,
    title: "Groceries",
    meta: "Cash · Today, 9:12 AM",
    amount: "−৳850.00",
    tone: "out",
    icon: (
      <>
        <path d="M6 7h12l-1 13H7z" />
        <path d="M9 7V5a3 3 0 0 1 6 0v2" />
      </>
    ),
  },
  {
    id: 2,
    title: "Salary — October",
    meta: "City Bank · Today, 8:00 AM",
    amount: "+৳45,000.00",
    tone: "in",
    icon: <path d="M12 4v16M8 8h6a3 3 0 0 1 0 6H8" />,
  },
  {
    id: 3,
    title: "Transfer to bKash",
    meta: "City Bank → bKash · Yesterday",
    amount: "৳5,000.00",
    tone: "tr",
    icon: <path d="M4 8h13l-3-3M20 16H7l3 3" />,
  },
];

function RecentActivity() {
  const navigate = useNavigate();
  return (
    <div className="bg-white border border-(--line) rounded-[18px] p-4 mt-3 shadow-[0_1px_2px_rgba(14,26,22,0.06)]">
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="m-0 text-[14px] font-bold tracking-[-0.15px]">Recent</h3>
        <Link
          to="/transactions"
          className="text-[12px] font-semibold text-(--brand) no-underline"
        >
          See all
        </Link>
      </div>

      <div>
        {RECENT.map((r, idx) => (
          <TransactionRow
            key={r.id}
            title={r.title}
            meta={r.meta}
            amount={r.amount}
            tone={r.tone}
            icon={r.icon}
            last={idx === RECENT.length - 1}
            onClick={() => navigate(`/transactions/${r.id}`)}
          />
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <div className="flex items-center justify-between gap-3 py-1.5 pb-3.5">
          <div>
            <div className="text-[12.5px] text-(--muted)">
              Thursday, 29 October
            </div>
            <h2 className="m-0 mt-0.5 text-[23px] font-bold tracking-[-0.5px] leading-tight">
              Good morning
            </h2>
          </div>
          <IconButton
            label="Lock app"
            icon={
              <>
                <rect x="4" y="10.5" width="16" height="10.5" rx="3" />
                <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
              </>
            }
          />
        </div>

        <BalanceCard />
        <QuickActions />
        <WeeklyChart />
        <CategoryBreakdown />
        <RecentActivity />
      </ScrollArea>
      <BottomNav active="home" />
    </PhoneFrame>
  );
}
