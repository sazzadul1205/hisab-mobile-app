import { useMemo, useState } from "react";
import {
  format,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  subDays,
  eachDayOfInterval,
} from "date-fns";
import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { IconButton } from "../../components/IconButton";
import { BottomNav } from "../../components/BottomNav";
import { SegmentedControl } from "../../components/SegmentedControl";
import { StatusPill } from "../../components/StatusPill";
import { BootScreen } from "../../auth/RouteGuards";
import { useAccounts } from "../../hooks/useAccounts";
import { useCategories } from "../../hooks/useTransactions";
import { netCashFlow, expensesByCategory } from "../../services/calc";
import { formatBDT, formatBDTShort } from "../../lib/money";

const TABS = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

const BAR_COLORS = ["#0E7C5A", "#2E9C7A", "#61B79B", "#9CD2C1"];

const TYPE_LABEL = {
  cash: "Cash",
  wallet: "Mobile wallet",
  bank: "Bank",
  other: "Other",
};

/* Defensive fallback in case money.js hasn't shipped formatBDTShort yet */
function bdtShort(minor) {
  if (typeof formatBDTShort === "function") return formatBDTShort(minor);
  const full = formatBDT(minor);
  return full.endsWith(".00") ? full.slice(0, -3) : full;
}

/* ================================================================
   Period helpers
   ================================================================ */

function getPeriod(tab) {
  const now = new Date();
  if (tab === "day") {
    return {
      from: startOfDay(now).toISOString(),
      to: endOfDay(now).toISOString(),
      subtitle: format(now, "d MMMM yyyy"),
      trendLabel: "Today",
    };
  }
  if (tab === "week") {
    const start = subDays(startOfDay(now), 6);
    return {
      from: start.toISOString(),
      to: endOfDay(now).toISOString(),
      subtitle: `${format(start, "d")}–${format(now, "d MMM yyyy")}`,
      trendLabel: "This week",
    };
  }
  return {
    from: startOfMonth(now).toISOString(),
    to: endOfMonth(now).toISOString(),
    subtitle: format(now, "MMMM yyyy"),
    trendLabel: "4 weeks",
  };
}

function trendBucket(tab, transactions, period) {
  if (tab === "day") {
    const buckets = [
      { label: "Morn", from: 0, to: 6 },
      { label: "Noon", from: 6, to: 12 },
      { label: "Eve", from: 12, to: 18 },
      { label: "Night", from: 18, to: 24 },
    ];
    return buckets.map((b) => {
      let expenses = 0;
      for (const t of transactions) {
        if (t.date < period.from || t.date > period.to) continue;
        const hour = new Date(t.date).getHours();
        if (hour < b.from || hour >= b.to) continue;
        if (t.type === "expense") expenses += t.amount;
        else if (t.type === "transfer" && (t.fee ?? 0) > 0) expenses += t.fee;
      }
      return { label: b.label, expenses };
    });
  }

  if (tab === "week") {
    const start = new Date(period.from);
    const end = new Date(period.to);
    return eachDayOfInterval({ start, end }).map((d) => {
      const from = startOfDay(d).toISOString();
      const to = endOfDay(d).toISOString();
      const f = netCashFlow(transactions, { from, to });
      return { label: format(d, "EEE"), expenses: f.expenses };
    });
  }

  // Month — split into 4 equal chunks (W1–W4)
  const startMs = new Date(period.from).getTime();
  const endMs = new Date(period.to).getTime();
  const chunkMs = Math.floor((endMs - startMs) / 4);
  return [0, 1, 2, 3].map((i) => {
    const fromMs = startMs + i * chunkMs;
    const toMs = i === 3 ? endMs : startMs + (i + 1) * chunkMs - 1;
    const f = netCashFlow(transactions, {
      from: new Date(fromMs).toISOString(),
      to: new Date(toMs).toISOString(),
    });
    return { label: `W${i + 1}`, expenses: f.expenses };
  });
}

/* ================================================================
   Cards
   ================================================================ */

function NetCashFlowCard({ flow }) {
  let netStr = formatBDT(flow.net);
  let netColor = "text-(--muted)";
  if (flow.net > 0) {
    netStr = `+${formatBDT(flow.net)}`;
    netColor = "text-(--in)";
  } else if (flow.net < 0) {
    netColor = "text-(--out)";
  }

  return (
    <div className="bg-(--card) border border-(--line) rounded-[18px] p-4 shadow-[0_1px_2px_rgba(14,26,22,0.06)]">
      <div className="text-[11.5px] font-bold tracking-[0.06em] uppercase text-(--muted)">
        Net cash flow
      </div>
      <div
        className={
          "num text-[30px] font-bold tracking-[-1.1px] mt-1.5 " + netColor
        }
      >
        {netStr}
      </div>
      <div className="h-px bg-(--line-2) my-3.5" />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-[11px] text-(--muted) font-semibold">Income</div>
          <div className="num text-[15px] font-bold text-(--in) mt-0.75">
            {formatBDT(flow.income)}
          </div>
        </div>
        <div>
          <div className="text-[11px] text-(--muted) font-semibold">
            Expenses
          </div>
          <div className="num text-[15px] font-bold text-(--out) mt-0.75">
            {formatBDT(flow.expenses)}
          </div>
        </div>
      </div>
    </div>
  );
}

function SpendingTrendCard({ trend, label }) {
  const max = Math.max(1, ...trend.map((t) => t.expenses));
  const isEmpty = trend.every((t) => t.expenses === 0);

  return (
    <div className="bg-(--card) border border-(--line) rounded-[18px] p-4 mt-3 shadow-[0_1px_2px_rgba(14,26,22,0.06)]">
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="m-0 text-[14px] font-bold tracking-[-0.15px]">
          Spending trend
        </h3>
        <StatusPill tone="neutral">{label}</StatusPill>
      </div>

      <div className="flex items-end gap-2.5 h-22">
        {trend.map((w) => (
          <div
            key={w.label}
            className="flex-1 flex items-end justify-center h-full"
          >
            <span
              className="block w-2.25 rounded-t-sm rounded-b-xs min-h-1"
              style={{
                height: `${Math.max(2, (w.expenses / max) * 100)}%`,
                background: "linear-gradient(180deg,#E2705F,#C8402F)",
                opacity: 0.85,
              }}
            />
          </div>
        ))}
      </div>

      <div className="flex gap-2.5 mt-2.5">
        {trend.map((w) => (
          <div
            key={w.label}
            className="flex-1 text-center text-[10px] text-(--muted) font-semibold"
          >
            {w.label}
          </div>
        ))}
      </div>

      {isEmpty && (
        <div className="text-center text-[11px] text-(--muted) mt-3 pt-3 border-t border-(--line-2)">
          No expenses in this period
        </div>
      )}
    </div>
  );
}

function ByCategoryCard({ categories }) {
  return (
    <div className="bg-(--card) border border-(--line) rounded-[18px] p-4 mt-3 shadow-[0_1px_2px_rgba(14,26,22,0.06)]">
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="m-0 text-[14px] font-bold tracking-[-0.15px]">
          By category
        </h3>
      </div>

      <div className="space-y-3.25">
        {categories.map((c, i) => (
          <div key={c.id}>
            <div className="flex justify-between items-baseline text-[12.5px] mb-1.5">
              <b className="font-semibold text-(--ink)">{c.name}</b>
              <span className="font-bold num text-(--ink-2)">
                {bdtShort(c.amount)}
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

function AccountBalancesCard({ accounts, balances }) {
  const active = accounts.filter((a) => !a.isArchived);

  return (
    <div className="bg-(--card) border border-(--line) rounded-[18px] p-4 mt-3 shadow-[0_1px_2px_rgba(14,26,22,0.06)]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="m-0 text-[14px] font-bold tracking-[-0.15px]">
          Account balances
        </h3>
      </div>

      <div>
        {active.map((a, i) => (
          <AccountBalanceRow
            key={a.id}
            name={a.name}
            type={TYPE_LABEL[a.type] ?? "Account"}
            amount={formatBDT(balances.get(a.id) ?? 0)}
            last={i === active.length - 1}
          />
        ))}
      </div>

      <div className="text-[11.5px] leading-[1.6] text-(--muted) bg-(--app) border border-dashed border-(--line) rounded-[14px] px-3.25 py-2.75 mt-2.5">
        Transfers are excluded from income and expense totals. Current balances
        shown — not period-dependent.
      </div>
    </div>
  );
}

function EmptyState({ tab, setTab, subtitle }) {
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
              {subtitle}
            </div>
          </div>
        </div>

        <SegmentedControl value={tab} options={TABS} onChange={setTab} />

        <div className="text-center py-10 px-4">
          <div className="w-13 h-13 rounded-2xl mx-auto mb-3 grid place-items-center bg-(--app) border border-dashed border-(--line) text-(--muted)">
            <svg
              viewBox="0 0 24 24"
              className="w-5.5 h-5.5 stroke-current fill-none stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]"
            >
              <path d="M5 19V11M11 19V5M17 19v-9" />
            </svg>
          </div>
          <b className="block text-[13.5px] font-semibold mb-1.25">
            No data yet
          </b>
          <small className="block text-[12px] text-(--muted) leading-[1.55] max-w-[34ch] mx-auto">
            Add an account and record some transactions to see reports here.
          </small>
        </div>
      </ScrollArea>
      <BottomNav active="reports" />
    </PhoneFrame>
  );
}

/* ================================================================
   Page
   ================================================================ */

export default function Reports() {
  const [tab, setTab] = useState("month");
  const { accounts, transactions, balances, loading: aLoad } = useAccounts();
  const { categories: allCategories, loading: cLoad } = useCategories();

  const categoryMap = useMemo(
    () => new Map(allCategories.map((c) => [c.id, c])),
    [allCategories],
  );

  const period = useMemo(() => getPeriod(tab), [tab]);
  const from = period.from;
  const to = period.to;

  const flow = useMemo(
    () => netCashFlow(transactions, { from, to }),
    [transactions, from, to],
  );

  const trend = useMemo(
    () => trendBucket(tab, transactions, period),
    [tab, transactions, period],
  );

  const categories = useMemo(() => {
    const map = expensesByCategory(transactions, { from, to });
    const entries = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
    const max = Math.max(1, ...entries.map(([, v]) => v));
    return entries.map(([catId, amount]) => ({
      id: catId,
      name: categoryMap.get(catId)?.name ?? "Unknown",
      amount,
      width: (amount / max) * 100,
    }));
  }, [transactions, from, to, categoryMap]);

  if (aLoad || cLoad) return <BootScreen />;
  if (accounts.length === 0) {
    return <EmptyState tab={tab} setTab={setTab} subtitle={period.subtitle} />;
  }

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
              {period.subtitle}
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

        <SegmentedControl value={tab} options={TABS} onChange={setTab} />

        <NetCashFlowCard flow={flow} />
        <SpendingTrendCard trend={trend} label={period.trendLabel} />
        {categories.length > 0 && <ByCategoryCard categories={categories} />}
        <AccountBalancesCard accounts={accounts} balances={balances} />
      </ScrollArea>
      <BottomNav active="reports" />
    </PhoneFrame>
  );
}
