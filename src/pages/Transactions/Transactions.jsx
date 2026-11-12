import { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths } from "date-fns";
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
import { formatBDT, parseMoney } from "../../lib/money";
import { Modal } from "../../components/Modal";
import { AmountInput } from "../../components/AmountInput";
import { DateTimeInput } from "../../components/DateTimeInput";
import { AccountSelect } from "../../components/AccountSelect";
import { CategoryPicker } from "../../components/CategoryPicker";
import { Button } from "../../components/Button";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
  { value: "transfer", label: "Transfer" },
];

const DATE_PRESETS = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "prevMonth", label: "Previous month" },
  { value: "custom", label: "Custom range" },
];

const SORT_OPTIONS = [
  { value: "dateDesc", label: "Newest first" },
  { value: "dateAsc", label: "Oldest first" },
  { value: "amountDesc", label: "Highest amount" },
  { value: "amountAsc", label: "Lowest amount" },
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

function FilterSheet({
  isOpen,
  onClose,
  accounts,
  categories,
  filters,
  onChange,
  onClear,
}) {
  const [datePreset, setDatePreset] = useState(filters.datePreset || "all");
  const [customFrom, setCustomFrom] = useState(filters.customFrom || "");
  const [customTo, setCustomTo] = useState(filters.customTo || "");
  const [accountId, setAccountId] = useState(filters.accountId || "");
  const [categoryId, setCategoryId] = useState(filters.categoryId || "");
  const [minAmount, setMinAmount] = useState(filters.minAmount || "");
  const [maxAmount, setMaxAmount] = useState(filters.maxAmount || "");
  const [sortBy, setSortBy] = useState(filters.sortBy || "dateDesc");
  const [showCustom, setShowCustom] = useState(datePreset === "custom");

  const applyFilters = useCallback(() => {
    const newFilters = {
      ...filters,
      datePreset,
      customFrom: showCustom ? customFrom : "",
      customTo: showCustom ? customTo : "",
      accountId,
      categoryId,
      minAmount: minAmount ? parseMoney(minAmount) : null,
      maxAmount: maxAmount ? parseMoney(maxAmount) : null,
      sortBy,
    };
    onChange(newFilters);
    onClose();
  }, [filters, datePreset, showCustom, customFrom, customTo, accountId, categoryId, minAmount, maxAmount, sortBy, onChange, onClose]);

  const handleDatePresetChange = (value) => {
    setDatePreset(value);
    setShowCustom(value === "custom");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Filters" size="full">
      <div className="space-y-6 pb-8">
        <div>
          <h3 className="text-[12px] font-semibold text-(--muted) uppercase tracking-wide mb-3">Date range</h3>
          <ChipStrip>
            {DATE_PRESETS.map((p) => (
              <Chip
                key={p.value}
                on={datePreset === p.value}
                onClick={() => handleDatePresetChange(p.value)}
              >
                {p.label}
              </Chip>
            ))}
          </ChipStrip>
          {showCustom && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              <DateTimeInput
                label="From"
                value={customFrom}
                onChange={setCustomFrom}
                type="date"
              />
              <DateTimeInput
                label="To"
                value={customTo}
                onChange={setCustomTo}
                type="date"
              />
            </div>
          )}
        </div>

        <div>
          <h3 className="text-[12px] font-semibold text-(--muted) uppercase tracking-wide mb-3">Account</h3>
          <AccountSelect
            accounts={accounts}
            value={accountId}
            onChange={setAccountId}
            placeholder="All accounts"
            includeEmpty
          />
        </div>

        <div>
          <h3 className="text-[12px] font-semibold text-(--muted) uppercase tracking-wide mb-3">Category</h3>
          <CategoryPicker
            categories={categories}
            value={categoryId}
            onChange={setCategoryId}
            placeholder="All categories"
            includeEmpty
          />
        </div>

        <div>
          <h3 className="text-[12px] font-semibold text-(--muted) uppercase tracking-wide mb-3">Amount range</h3>
          <div className="grid grid-cols-2 gap-3">
            <AmountInput
              label="Min"
              value={minAmount}
              onChange={setMinAmount}
              placeholder="0"
            />
            <AmountInput
              label="Max"
              value={maxAmount}
              onChange={setMaxAmount}
              placeholder="No limit"
            />
          </div>
        </div>

        <div>
          <h3 className="text-[12px] font-semibold text-(--muted) uppercase tracking-wide mb-3">Sort by</h3>
          <ChipStrip>
            {SORT_OPTIONS.map((s) => (
              <Chip
                key={s.value}
                on={sortBy === s.value}
                onClick={() => setSortBy(s.value)}
              >
                {s.label}
              </Chip>
            ))}
          </ChipStrip>
        </div>

        <div className="flex gap-2 pt-4 border-t border-(--line)">
          <Button variant="ghost" onClick={onClear} className="flex-1">
            Clear all
          </Button>
          <Button onClick={applyFilters} className="flex-1">
            Apply
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function FilterChips({ filters, onRemove, activeCount }) {
  const chips = [];
  
  if (filters.type && filters.type !== "all") {
    chips.push({ key: "type", label: filters.type, onRemove: () => onRemove("type") });
  }
  if (filters.datePreset && filters.datePreset !== "all") {
    const preset = DATE_PRESETS.find((p) => p.value === filters.datePreset);
    chips.push({ key: "date", label: preset?.label ?? filters.datePreset, onRemove: () => onRemove("date") });
  }
  if (filters.accountId) {
    chips.push({ key: "account", label: `Account: ${filters.accountId}`, onRemove: () => onRemove("account") });
  }
  if (filters.categoryId) {
    chips.push({ key: "category", label: `Category: ${filters.categoryId}`, onRemove: () => onRemove("category") });
  }
  if (filters.minAmount != null) {
    chips.push({ key: "minAmount", label: `Min: ${formatBDT(filters.minAmount)}`, onRemove: () => onRemove("minAmount") });
  }
  if (filters.maxAmount != null) {
    chips.push({ key: "maxAmount", label: `Max: ${formatBDT(filters.maxAmount)}`, onRemove: () => onRemove("maxAmount") });
  }
  if (filters.sortBy && filters.sortBy !== "dateDesc") {
    const sort = SORT_OPTIONS.find((s) => s.value === filters.sortBy);
    chips.push({ key: "sort", label: `Sort: ${sort?.label ?? filters.sortBy}`, onRemove: () => onRemove("sort") });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex items-center gap-2 mb-3 flex-wrap">
      <span className="text-[11px] font-semibold text-(--muted)">Active filters:</span>
      {chips.map((c) => (
        <Chip
          key={c.key}
          onClick={c.onRemove}
          className="cursor-pointer"
          style={{ fontSize: "11px" }}
        >
          {c.label}
        </Chip>
      ))}
      {activeCount > chips.length && (
        <Chip ghost onClick={onRemove} style={{ fontSize: "11px" }}>
          +{activeCount - chips.length} more
        </Chip>
      )}
      <Chip ghost onClick={onRemove} style={{ fontSize: "11px" }}>
        Clear all
      </Chip>
    </div>
  );
}

export default function Transactions() {
  const navigate = useNavigate();
  const { transactions, loading } = useTransactions();
  const { accountMap, categoryMap, loading: lookupLoading } = useLookup();
  const [activeType, setActiveType] = useState("all");
  const [search, setSearch] = useState("");
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [filters, setFilters] = useState({
    type: "all",
    datePreset: "all",
    customFrom: "",
    customTo: "",
    accountId: "",
    categoryId: "",
    minAmount: null,
    maxAmount: null,
    sortBy: "dateDesc",
  });

  const accounts = useMemo(() => [...accountMap.values()], [accountMap]);
  const categories = useMemo(() => [...categoryMap.values()], [categoryMap]);

  const filtered = useMemo(() => {
    let list = transactions;

    // Type filter
    if (activeType !== "all") {
      list = list.filter((t) => t.type === activeType);
    }

    // Search
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

    // Advanced filters
    if (filters.accountId) {
      list = list.filter(
        (t) => t.accountId === filters.accountId || t.destinationAccountId === filters.accountId
      );
    }
    if (filters.categoryId) {
      list = list.filter((t) => t.categoryId === filters.categoryId);
    }
    if (filters.minAmount != null) {
      list = list.filter((t) => t.amount >= filters.minAmount);
    }
    if (filters.maxAmount != null) {
      list = list.filter((t) => t.amount <= filters.maxAmount);
    }

    // Date range
    if (filters.datePreset !== "all") {
      const now = new Date();
      let from, to;
      switch (filters.datePreset) {
        case "today":
          from = startOfDay(now).toISOString();
          to = endOfDay(now).toISOString();
          break;
        case "week":
          from = startOfWeek(now, { weekStartsOn: 0 }).toISOString();
          to = endOfWeek(now, { weekStartsOn: 0 }).toISOString();
          break;
        case "month":
          from = startOfMonth(now).toISOString();
          to = endOfMonth(now).toISOString();
          break;
        case "prevMonth": {
          const prevMonth = subMonths(now, 1);
          from = startOfMonth(prevMonth).toISOString();
          to = endOfMonth(prevMonth).toISOString();
          break;
        }
        case "custom":
          if (filters.customFrom) from = new Date(filters.customFrom).toISOString();
          if (filters.customTo) to = new Date(filters.customTo).toISOString();
          break;
      }
      if (from) list = list.filter((t) => t.date >= from);
      if (to) list = list.filter((t) => t.date <= to);
    }

    // Sort
    switch (filters.sortBy) {
      case "dateAsc":
        list.sort((a, b) => a.date.localeCompare(b.date));
        break;
      case "amountDesc":
        list.sort((a, b) => b.amount - a.amount);
        break;
      case "amountAsc":
        list.sort((a, b) => a.amount - b.amount);
        break;
      case "dateDesc":
      default:
        list.sort((a, b) => b.date.localeCompare(a.date));
        break;
    }

    return list;
  }, [transactions, activeType, search, accountMap, categoryMap, filters]);

  const groups = useMemo(() => groupByDay(filtered), [filtered]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (activeType !== "all") count++;
    if (filters.datePreset !== "all") count++;
    if (filters.accountId) count++;
    if (filters.categoryId) count++;
    if (filters.minAmount != null) count++;
    if (filters.maxAmount != null) count++;
    if (filters.sortBy !== "dateDesc") count++;
    return count;
  }, [activeType, filters]);

  const handleClearFilters = () => {
    setActiveType("all");
    setSearch("");
    setFilters({
      type: "all",
      datePreset: "all",
      customFrom: "",
      customTo: "",
      accountId: "",
      categoryId: "",
      minAmount: null,
      maxAmount: null,
      sortBy: "dateDesc",
    });
  };

  const handleRemoveFilter = (key) => {
    switch (key) {
      case "type":
        setActiveType("all");
        break;
      case "date":
        setFilters((f) => ({ ...f, datePreset: "all", customFrom: "", customTo: "" }));
        break;
      case "account":
        setFilters((f) => ({ ...f, accountId: "" }));
        break;
      case "category":
        setFilters((f) => ({ ...f, categoryId: "" }));
        break;
      case "minAmount":
        setFilters((f) => ({ ...f, minAmount: null }));
        break;
      case "maxAmount":
        setFilters((f) => ({ ...f, maxAmount: null }));
        break;
      case "sort":
        setFilters((f) => ({ ...f, sortBy: "dateDesc" }));
        break;
    }
  };

  if (loading || lookupLoading) return <BootScreen />;

  return (
    <PhoneFrame>
      <StatusBar />
      <PullToRefresh
        onRefresh={async () => {
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
            label="Filters"
            icon={<path d="M4 6h16M7 12h10M10 18h4" />}
            onClick={() => setShowFilterSheet(true)}
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
        </ChipStrip>

        <FilterChips
          filters={filters}
          onRemove={handleRemoveFilter}
          activeCount={activeFilterCount}
        />

        <FilterSheet
          isOpen={showFilterSheet}
          onClose={() => setShowFilterSheet(false)}
          accounts={accounts}
          categories={categories}
          filters={filters}
          onChange={setFilters}
          onClear={handleClearFilters}
        />

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
