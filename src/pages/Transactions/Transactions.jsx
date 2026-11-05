import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { PhoneFrame, StatusBar } from "../../components/PhoneFrame";
import { PullToRefresh } from "../../components/PullToRefresh";
import { IconButton } from "../../components/IconButton";
import { BottomNav } from "../../components/BottomNav";
import { SectionLabel } from "../../components/SectionLabel";
import { SearchBar } from "../../components/SearchBar";
import { Chip, ChipStrip } from "../../components/Chip";
import { TransactionRow } from "../../components/TransactionRow";
import { BootScreen } from "../../auth/RouteGuards";
import { useTransactions, useLookup } from "../../hooks/useTransactions";
import { formatBDT } from "../../lib/money";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
  { value: "transfer", label: "Transfer" },
];

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

function formatGroupLabel(isoDay) {
  const today = new Date().toISOString().slice(0, 10);
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yesterday = y.toISOString().slice(0, 10);
  const d = new Date(isoDay + "T00:00:00");
  if (isoDay === today) return `Today · ${format(d, "d MMM")}`;
  if (isoDay === yesterday) return `Yesterday · ${format(d, "d MMM")}`;
  return format(d, "d MMM");
}

function groupByDay(transactions) {
  const map = new Map();
  for (const tx of transactions) {
    const day = tx.date.slice(0, 10);
    if (!map.has(day)) map.set(day, []);
    map.get(day).push(tx);
  }
  return [...map.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([day, rows]) => ({
      day,
      label: formatGroupLabel(day),
      rows: rows.sort((a, b) => b.date.localeCompare(a.date)),
    }));
}

export default function Transactions() {
  const navigate = useNavigate();
  const { transactions, loading } = useTransactions();
  const { accountMap, categoryMap, loading: lookupLoading } = useLookup();
  const [activeType, setActiveType] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = transactions;
    if (activeType !== "all") {
      list = list.filter((t) => t.type === activeType);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((t) => {
        const note = (t.note ?? "").toLowerCase();
        const cat = (categoryMap.get(t.categoryId)?.name ?? "").toLowerCase();
        const from = (accountMap.get(t.accountId)?.name ?? "").toLowerCase();
        const to = (
          accountMap.get(t.destinationAccountId)?.name ?? ""
        ).toLowerCase();
        return (
          note.includes(q) ||
          cat.includes(q) ||
          from.includes(q) ||
          to.includes(q)
        );
      });
    }
    return list;
  }, [transactions, activeType, search, accountMap, categoryMap]);

  const groups = useMemo(() => groupByDay(filtered), [filtered]);

  if (loading || lookupLoading) return <BootScreen />;

  return (
    <PhoneFrame>
      <StatusBar />
      <PullToRefresh
        onRefresh={async () => {
          // Dexie useLiveQuery re-runs automatically on DB changes.
          // This delay gives the user visual feedback of a refresh.
          await new Promise((res) => setTimeout(res, 800));
        }}
      >
        <div className="flex items-center justify-between gap-3 py-1.5 pb-3.5">
          <div>
            <h2 className="m-0 text-[23px] font-bold tracking-[-0.5px] leading-tight">
              Transactions
            </h2>
            <div className="text-[12.5px] text-(--muted) mt-0.75">
              {filtered.length} {filtered.length === 1 ? "record" : "records"}
            </div>
          </div>
          <IconButton
            label="Sort and filter"
            icon={<path d="M4 6h16M7 12h10M10 18h4" />}
          />
        </div>

        <SearchBar
          placeholder="Search notes, categories, accounts"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <ChipStrip>
          {FILTERS.map((f) => (
            <Chip
              key={f.value}
              on={activeType === f.value}
              onClick={() => setActiveType(f.value)}
            >
              {f.label}
            </Chip>
          ))}
          <Chip ghost>Filters</Chip>
        </ChipStrip>

        {groups.length === 0 ? (
          <div className="text-center py-10 px-4">
            <div className="w-13 h-13 rounded-2xl mx-auto mb-3 grid place-items-center bg-(--app) border border-dashed border-(--line) text-(--muted)">
              <svg
                viewBox="0 0 24 24"
                className="w-5.5 h-5.5 stroke-current fill-none stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]"
              >
                <path d="M6 3.5h12v17l-3-1.8-3 1.8-3-1.8-3 1.8z" />
              </svg>
            </div>
            <b className="block text-[13.5px] font-semibold mb-1.25">
              {transactions.length === 0 ? "No transactions yet" : "No matches"}
            </b>
            <small className="block text-[12px] text-(--muted) leading-[1.55]">
              {transactions.length === 0
                ? "Record your first income or expense to see it here."
                : "Try a different filter or search term."}
            </small>
          </div>
        ) : (
          <div className="stagger">
            {groups.map((g, gi) => (
              <div key={g.day} className={gi === 0 ? "mt-3" : "mt-1"}>
                <SectionLabel>{g.label}</SectionLabel>
                <div className="bg-(--card) border border-(--line) rounded-[18px] py-1 px-3.5">
                  {g.rows.map((tx, ri) => {
                    const fromName = accountMap.get(tx.accountId)?.name ?? "—";
                    const toName =
                      accountMap.get(tx.destinationAccountId)?.name ?? "—";
                    const catName = categoryMap.get(tx.categoryId)?.name;
                    const meta =
                      tx.type === "transfer"
                        ? `${fromName} → ${toName}`
                        : `${fromName}${catName ? ` · ${catName}` : ""}`;
                    return (
                      <TransactionRow
                        key={tx.id}
                        tone={TYPE_TONE[tx.type]}
                        icon={TYPE_ICON[tx.type]}
                        title={tx.note || catName || tx.type}
                        meta={meta}
                        amount={formatAmount(tx)}
                        last={ri === g.rows.length - 1}
                        onClick={() => navigate(`/transactions/${tx.id}`)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </PullToRefresh>
      <BottomNav active="activity" />
    </PhoneFrame>
  );
}
