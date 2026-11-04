import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { AppBar } from "../../components/AppBar";
import { IconButton } from "../../components/IconButton";
import { SectionLabel } from "../../components/SectionLabel";
import { TransactionRow } from "../../components/TransactionRow";
import { Chip, ChipStrip } from "../../components/Chip";
import { Note } from "../../components/Note";
import { Button } from "../../components/Button";
import { useAccount } from "../../hooks/useAccounts";
import { formatBDT } from "../../lib/money";

const TONE_TO_TYPE = { in: "income", out: "expense", tr: "transfer" };

const FILTERS = [
  { value: "all", label: "All" },
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
  { value: "transfer", label: "Transfer" },
];

/* Icons chosen by transaction type */
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

const TYPE_TONE = { income: "in", expense: "out", transfer: "tr" };

function rowFor(tx) {
  return {
    id: tx.id,
    tone: TYPE_TONE[tx.type],
    icon: TYPE_ICON[tx.type],
    title: tx.note || tx.categoryId || tx.type,
    meta: `${tx.type.charAt(0).toUpperCase() + tx.type.slice(1)} · ${format(new Date(tx.date), "d MMM, h:mm a")}`,
    amount: formatAmount(tx),
  };
}

function formatAmount(tx) {
  if (tx.type === "income") return `+${formatBDT(tx.amount)}`;
  if (tx.type === "expense") return `−${formatBDT(tx.amount)}`;
  return formatBDT(tx.amount);
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

export default function AccountDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { account, transactions, balance, loading } = useAccount(id);
  const [activeType, setActiveType] = useState("all");
  const openDetail = (txId) => navigate(`/transactions/${txId}`);

  if (loading) {
    return (
      <PhoneFrame>
        <StatusBar />
        <ScrollArea>
          <div className="p-4">
            <div className="h-8 bg-(--line-2) rounded w-40 mb-2 animate-pulse" />
            <div className="h-4 bg-(--line-2) rounded w-48 mb-6 animate-pulse" />
            <div className="h-24 bg-(--line-2) rounded-[18px] animate-pulse" />
          </div>
        </ScrollArea>
      </PhoneFrame>
    );
  }

  if (!account) {
    return (
      <PhoneFrame>
        <StatusBar />
        <ScrollArea>
          <AppBar title="Not found" />
          <div className="text-center py-10 px-4">
            <b className="block text-[13.5px] font-semibold mb-2">
              Account not found
            </b>
            <small className="block text-[12px] text-(--muted) mb-4">
              It may have been deleted.
            </small>
            <Button onClick={() => navigate("/accounts")}>
              Back to accounts
            </Button>
          </div>
        </ScrollArea>
      </PhoneFrame>
    );
  }

  const groups = groupByDay(transactions);
  const filteredGroups = groups
    .map((g) => ({
      ...g,
      rows:
        activeType === "all"
          ? g.rows
          : g.rows.filter((r) => TONE_TO_TYPE[rowFor(r).tone] === activeType),
    }))
    .filter((g) => g.rows.length > 0);

  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <AppBar
          title={account.name}
          subtitle={
            account.isArchived
              ? "Archived"
              : `${ACCOUNT_TYPE_LABEL_FALLBACK[account.type] ?? "Account"} · active`
          }
          right={
            <IconButton
              label="Edit account"
              icon={
                <>
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                </>
              }
              onClick={() => navigate(`/accounts/${id}/edit`)}
            />
          }
        />

        <div className="stagger">
        <div
          className="rounded-[18px] p-5 text-white"
          style={{ background: "linear-gradient(150deg, #118A64, #0A5A41)" }}
        >
          <div className="text-[11.5px] font-semibold tracking-[0.06em] uppercase text-white/70">
            Calculated balance
          </div>
          <div className="num text-[29px] font-bold tracking-[-1px] mt-1.5">
            {formatBDT(balance)}
          </div>
          <div className="text-[11.5px] text-white/65 mt-1">
            Opening {formatBDT(account.openingBalance)} · {transactions.length}{" "}
            {transactions.length === 1 ? "transaction" : "transactions"}
          </div>
        </div>

        {!account.isArchived && (
          <div className="grid grid-cols-2 gap-2.5 mt-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/accounts/${id}/reconcile`)}
            >
              Reconcile
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/accounts/${id}/archive`)}
            >
              Archive
            </Button>
          </div>
        )}

        <div className="mt-3.5">
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
            <Chip ghost>Date range</Chip>
          </ChipStrip>
        </div>

        {filteredGroups.length === 0 ? (
          <div className="text-center py-8 px-4">
            <small className="block text-[12px] text-(--muted) leading-[1.55]">
              {transactions.length === 0
                ? "No transactions on this account yet."
                : "No transactions match this filter."}
            </small>
          </div>
        ) : (
          filteredGroups.map((g, gi) => (
            <div key={g.day}>
              <SectionLabel className={gi === 0 ? "mt-5" : ""}>
                {g.label}
              </SectionLabel>
              <div className="bg-(--card) border border-(--line) rounded-[18px] py-1 px-3.5">
                {g.rows.map((r, ri) => {
                  const display = rowFor(r);
                  return (
                    <TransactionRow
                      key={r.id}
                      tone={display.tone}
                      icon={display.icon}
                      title={display.title}
                      meta={display.meta}
                      amount={display.amount}
                      last={ri === g.rows.length - 1}
                      onClick={() => openDetail(r.id)}
                    />
                  );
                })}
              </div>
            </div>
          ))
        )}

        <Note>
          {account.isArchived
            ? "Archived accounts remain viewable for historical reference. Data is never deleted on archive."
            : "Archiving never deletes data. Archived accounts can be restored at any time."}
        </Note>
      </div>
      </ScrollArea>
    </PhoneFrame>
  );
}

const ACCOUNT_TYPE_LABEL_FALLBACK = {
  cash: "Cash",
  wallet: "Mobile wallet",
  bank: "Bank account",
  other: "Other",
};
