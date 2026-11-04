import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { IconButton } from "../../components/IconButton";
import { BottomNav } from "../../components/BottomNav";
import { TransactionRow } from "../../components/TransactionRow";
import { useAccounts } from "../../hooks/useAccounts";
import { useLookup } from "../../hooks/useTransactions";
import { netCashFlow, expensesByCategory } from "../../services/calc";
import { formatBDT, formatBDTShort } from "../../lib/money";

/* ================================================================
   Pure helpers (module scope so identity is stable across renders)
   ================================================================ */

function startOfLocalDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfLocalDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function computeTodayFlow(transactions) {
  return netCashFlow(transactions, {
    from: startOfLocalDay().toISOString(),
    to: endOfLocalDay().toISOString(),
  });
}

function computeWeekData(transactions) {
  const days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const flow = netCashFlow(transactions, {
      from: startOfLocalDay(d).toISOString(),
      to: endOfLocalDay(d).toISOString(),
    });
    days.push({
      label: format(d, "EEE"),
      income: flow.income,
      expenses: flow.expenses,
    });
  }
  const max = Math.max(1, ...days.flatMap((d) => [d.income, d.expenses]));
  return { days, max };
}

function computeCategories(transactions, categoryMap) {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const map = expensesByCategory(transactions, {
    from: monthStart.toISOString(),
  });
  const entries = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  const max = Math.max(1, ...entries.map(([, v]) => v));
  return entries.map(([catId, amount]) => ({
    id: catId,
    name: categoryMap.get(catId)?.name ?? "Unknown",
    amount,
    width: (amount / max) * 100,
  }));
}

function computeRecent(transactions) {
  return [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);
}

const BAR_COLORS = ["#0E7C5A", "#2E9C7A", "#61B79B", "#9CD2C1"];

const TYPE_TONE = { income: "in", expense: "out", transfer: "tr" };
const TYPE_ICON = {
  income: <path d="M12 4v16M8 8h6a3 3 0 0 1 0 6H8" />,
  expense: (
    <>
      <path d="M5 12h14" />
      <circle cx="12" cy="12" r="9" />
    </>
  ),
  transfer: <path d="M4 8h13l-3-3M20 16H7l3 3" />,
};

function formatAmount(tx) {
  if (tx.type === "income") return `+${formatBDT(tx.amount)}`;
  if (tx.type === "expense") return `−${formatBDT(tx.amount)}`;
  return formatBDT(tx.amount);
}

/* ================================================================
   Sub-components
   ================================================================ */

function BalanceCard({ total, today, activeCount }) {
  const net = today.income - today.expenses;
  const netStr = net > 0 ? `+${formatBDTShort(net)}` : formatBDTShort(net);

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
        {formatBDT(total)}
      </div>
      <div className="text-[12px] text-white/65">
        {activeCount} active {activeCount === 1 ? "account" : "accounts"} · BDT
      </div>

      <div
        className="grid grid-cols-3 gap-2 mt-4.5 pt-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.16)" }}
      >
        <Stat label="Income today" value={formatBDTShort(today.income)} />
        <Stat label="Expenses today" value={formatBDTShort(today.expenses)} />
        <Stat label="Net flow" value={netStr} />
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
  in: "bg-(--brand-soft) text-(--in)",
  out: "bg-(--danger-soft) text-(--out)",
  tr: "bg-(--tr-soft) text-(--tr)",
  im: "bg-(--warn-soft) text-(--warn)",
};

function QuickActions() {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-4 gap-2 mt-3">
      {ACTIONS.map((a) => (
        <button
          key={a.label}
          onClick={() => navigate(a.to)}
          className="flex flex-col items-center gap-1.75 pt-3.25 pb-2.75 px-1
                     bg-(--card) border border-(--line) rounded-[14px]
                     text-[10.5px] font-semibold text-(--ink-2)
                     cursor-pointer font-[inherit]"
        >
          <span
            className={`w-8 h-8 rounded-[10px] grid place-items-center ${TONE_STYLES[a.tone]}`}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 stroke-current fill-none stroke-2 [stroke-linecap:round] [stroke-linejoin:round]"
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

function WeeklyChart({ data }) {
  const { days, max } = data;
  const totalIncome = days.reduce((s, d) => s + d.income, 0);
  const totalExpense = days.reduce((s, d) => s + d.expenses, 0);
  const isEmpty = totalIncome === 0 && totalExpense === 0;

  return (
    <div className="bg-(--card) border border-(--line) rounded-[18px] p-4 mt-3 shadow-[0_1px_2px_rgba(14,26,22,0.06)]">
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
        {days.map((d) => (
          <div
            key={d.label}
            className="flex-1 flex items-end justify-center gap-0.75 h-full"
          >
            <span
              className="block w-2.25 rounded-t-sm rounded-b-xs min-h-1"
              style={{
                height: `${Math.max(2, (d.income / max) * 100)}%`,
                background: "linear-gradient(180deg,#18A577,#0E7C5A)",
              }}
            />
            <span
              className="block w-2.25 rounded-t-sm rounded-b-xs min-h-1"
              style={{
                height: `${Math.max(2, (d.expenses / max) * 100)}%`,
                background: "linear-gradient(180deg,#E2705F,#C8402F)",
                opacity: 0.85,
              }}
            />
          </div>
        ))}
      </div>

      <div className="flex gap-2.5 mt-2.5">
        {days.map((d) => (
          <div
            key={d.label}
            className="flex-1 text-center text-[10px] text-(--muted) font-semibold"
          >
            {d.label}
          </div>
        ))}
      </div>

      {isEmpty ? (
        <div className="text-center text-[11px] text-(--muted) mt-3 pt-3 border-t border-(--line-2)">
          No activity this week
        </div>
      ) : (
        <div
          className="flex gap-3.5 mt-3 pt-3 border-t border-(--line-2)
                     text-[11px] text-(--muted) font-semibold"
        >
          <span className="flex items-center gap-1.5">
            <i
              className="w-2 h-2 rounded-[3px] inline-block"
              style={{ background: "var(--in)" }}
            />
            Income {formatBDTShort(totalIncome)}
          </span>
          <span className="flex items-center gap-1.5">
            <i
              className="w-2 h-2 rounded-[3px] inline-block"
              style={{ background: "var(--out)" }}
            />
            Expense {formatBDTShort(totalExpense)}
          </span>
        </div>
      )}
    </div>
  );
}

function CategoryBreakdown({ categories }) {
  return (
    <div className="bg-(--card) border border-(--line) rounded-[18px] p-4 mt-3 shadow-[0_1px_2px_rgba(14,26,22,0.06)]">
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="m-0 text-[14px] font-bold tracking-[-0.15px]">
          Expense breakdown
        </h3>
        <Link
          to="/reports"
          className="text-[12px] font-semibold text-(--brand) no-underline"
        >
          All
        </Link>
      </div>

      <div className="space-y-3.25">
        {categories.map((c, i) => (
          <div key={c.id}>
            <div className="flex justify-between items-baseline text-[12.5px] mb-1.5">
              <b className="font-semibold text-(--ink)">{c.name}</b>
              <span className="font-bold num text-(--ink-2)">
                {formatBDTShort(c.amount)}
              </span>
            </div>
            <div className="h-1.75 rounded-full bg-(--line-2) overflow-hidden">
              <i
                className="block h-full rounded-full"
                style={{
                  width: `${c.width}%`,
                  background: BAR_COLORS[i % BAR_COLORS.length],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentActivity({ items, accountMap, categoryMap }) {
  const navigate = useNavigate();
  return (
    <div className="bg-(--card) border border-(--line) rounded-[18px] p-4 mt-3 shadow-[0_1px_2px_rgba(14,26,22,0.06)]">
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
        {items.map((tx, idx) => {
          const fromName = accountMap.get(tx.accountId)?.name ?? "—";
          const toName = accountMap.get(tx.destinationAccountId)?.name ?? "—";
          const catName = categoryMap.get(tx.categoryId)?.name;
          const meta =
            tx.type === "transfer"
              ? `${fromName} → ${toName} · ${format(new Date(tx.date), "h:mm a")}`
              : `${fromName}${catName ? ` · ${catName}` : ""} · ${format(new Date(tx.date), "h:mm a")}`;

          return (
            <TransactionRow
              key={tx.id}
              tone={TYPE_TONE[tx.type]}
              icon={TYPE_ICON[tx.type]}
              title={tx.note || catName || tx.type}
              meta={meta}
              amount={formatAmount(tx)}
              last={idx === items.length - 1}
              onClick={() => navigate(`/transactions/${tx.id}`)}
            />
          );
        })}
      </div>
    </div>
  );
}

function OnboardingEmpty({ onAdd }) {
  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <div className="flex items-center justify-between gap-3 py-1.5 pb-3.5">
          <div>
            <div className="text-[12.5px] text-(--muted)">Welcome to Hisab</div>
            <h2 className="m-0 mt-0.5 text-[23px] font-bold tracking-[-0.5px] leading-tight">
              Let's get started
            </h2>
          </div>
        </div>

        <div className="text-center py-10 px-4 mt-4">
          <div className="w-16 h-16 rounded-[22px] mx-auto mb-4 grid place-items-center bg-(--brand-soft) text-(--brand-dk)">
            <svg
              viewBox="0 0 24 24"
              className="w-7 h-7 stroke-current fill-none stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]"
            >
              <rect x="3" y="6" width="18" height="12" rx="3" />
              <path d="M3 10h18" />
              <circle cx="17" cy="14" r="1" />
            </svg>
          </div>
          <b className="block text-[15px] font-bold mb-2">
            Add your first account
          </b>
          <small className="block text-[12.5px] text-(--muted) leading-[1.6] max-w-[34ch] mx-auto mb-5">
            Cash, bKash, Nagad, or a bank — start with the account you use most,
            then track income and expenses as you go.
          </small>
          <button
            onClick={onAdd}
            className="w-full p-3.75 rounded-[14px] font-bold text-[14.5px]
                       tracking-[-0.1px] border-0 cursor-pointer
                       bg-(--brand) text-white
                       shadow-[0_10px_20px_-12px_rgba(14,124,90,0.9)]"
          >
            + Add account
          </button>
        </div>
      </ScrollArea>
      <BottomNav active="home" />
    </PhoneFrame>
  );
}

function DashboardSkeleton() {
  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <div className="p-4">
          {/* Header */}
          <div className="skeleton-box h-3 w-32 rounded mb-2" />
          <div className="skeleton-box h-7 w-48 rounded mb-6" />

          {/* Balance Card */}
          <div className="skeleton-box h-44 rounded-3xl mb-3" />

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="skeleton-box h-20 rounded-[14px]" />
            ))}
          </div>

          {/* Chart Card */}
          <div className="skeleton-box h-48 rounded-[18px] mb-3" />

          {/* Category Card */}
          <div className="skeleton-box h-40 rounded-[18px] mb-3" />

          {/* Recent Card */}
          <div className="skeleton-box h-36 rounded-[18px]" />
        </div>
      </ScrollArea>
      <BottomNav active="home" />
    </PhoneFrame>
  );
}

/* ================================================================
   Page
   ================================================================ */

export default function Dashboard() {
  const navigate = useNavigate();
  const { accounts, transactions, combined, loading: aLoad } = useAccounts();
  const { accountMap, categoryMap, loading: lookupLoading } = useLookup();

  // ALL hooks before any early return
  const today = useMemo(() => computeTodayFlow(transactions), [transactions]);
  const week = useMemo(() => computeWeekData(transactions), [transactions]);
  const categories = useMemo(
    () => computeCategories(transactions, categoryMap),
    [transactions, categoryMap],
  );
  const recent = useMemo(() => computeRecent(transactions), [transactions]);

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const dateLabel = format(now, "EEEE, d MMMM");

  if (aLoad || lookupLoading) return <DashboardSkeleton />;

  if (accounts.length === 0) {
    return <OnboardingEmpty onAdd={() => navigate("/accounts/new")} />;
  }

  const activeCount = accounts.filter((a) => !a.isArchived).length;

  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <div className="flex items-center justify-between gap-3 py-1.5 pb-3.5">
          <div>
            <div className="text-[12.5px] text-(--muted)">{dateLabel}</div>
            <h2 className="m-0 mt-0.5 text-[23px] font-bold tracking-[-0.5px] leading-tight">
              {greeting}
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
            onClick={() => navigate("/security")}
          />
        </div>

        <BalanceCard total={combined} today={today} activeCount={activeCount} />
        <QuickActions />
        <WeeklyChart data={week} />
        {categories.length > 0 && <CategoryBreakdown categories={categories} />}
        {recent.length > 0 ? (
          <RecentActivity
            items={recent}
            accountMap={accountMap}
            categoryMap={categoryMap}
          />
        ) : (
          <div className="bg-(--card) border border-(--line) rounded-[18px] p-4 mt-3 text-center">
            <small className="text-[12px] text-(--muted)">
              No transactions yet. Tap Income or Expense to record your first.
            </small>
          </div>
        )}
      </ScrollArea>
      <BottomNav active="home" />
    </PhoneFrame>
  );
}
