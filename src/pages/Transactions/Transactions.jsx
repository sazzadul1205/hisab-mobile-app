import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { IconButton } from "../../components/IconButton";
import { BottomNav } from "../../components/BottomNav";
import { SectionLabel } from "../../components/SectionLabel";
import { SearchBar } from "../../components/SearchBar";
import { Chip, ChipStrip } from "../../components/Chip";
import { TransactionRow } from "../../components/TransactionRow";

/* ----------------------------------------------------------------
   Icon set for this page (reused across rows)
   ---------------------------------------------------------------- */
const ICONS = {
  salary: <path d="M12 4v16M8 8h6a3 3 0 0 1 0 6H8" />,
  bag: (
    <>
      <path d="M6 7h12l-1 13H7z" />
      <path d="M9 7V5a3 3 0 0 1 6 0v2" />
    </>
  ),
  minusCircle: (
    <>
      <path d="M5 12h14" />
      <circle cx="12" cy="12" r="9" />
    </>
  ),
  transfer: <path d="M4 8h13l-3-3M20 16H7l3 3" />,
  bolt: <path d="M13 3 5 14h6l-1 7 8-11h-6z" />,
  card: (
    <>
      <path d="M4 7h16v12H4z" />
      <path d="M4 11h16" />
    </>
  ),
};

/* ----------------------------------------------------------------
   Data groups
   ---------------------------------------------------------------- */
const GROUPS = [
  {
    label: "Today · 29 Oct",
    rows: [
      {
        id: "t1",
        tone: "in",
        icon: ICONS.salary,
        title: "Salary — October",
        meta: "City Bank · Income",
        amount: "+৳45,000.00",
      },
      {
        id: "t2",
        tone: "out",
        icon: ICONS.bag,
        title: "Groceries",
        meta: "Cash · Household",
        amount: "−৳850.00",
      },
      {
        id: "t3",
        tone: "out",
        icon: ICONS.minusCircle,
        title: "Rickshaw fare",
        meta: "Cash · Transport",
        amount: "−৳120.00",
      },
    ],
  },
  {
    label: "Yesterday · 28 Oct",
    rows: [
      {
        id: "t4",
        tone: "tr",
        icon: ICONS.transfer,
        title: "Transfer to bKash",
        meta: "City Bank → bKash",
        amount: "৳5,000.00",
      },
      {
        id: "t5",
        tone: "out",
        icon: ICONS.bolt,
        title: "Electricity bill",
        meta: "bKash · Utilities",
        amount: "−৳1,850.00",
      },
      {
        id: "t6",
        tone: "in",
        icon: ICONS.salary,
        title: "Freelance payment",
        meta: "bKash · Side income",
        amount: "+৳8,000.00",
      },
    ],
  },
  {
    label: "27 Oct",
    rows: [
      {
        id: "t7",
        tone: "out",
        icon: ICONS.card,
        title: "Mobile recharge",
        meta: "bKash · Utilities",
        amount: "−৳550.00",
      },
    ],
  },
];

export default function Transactions() {
  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        {/* Header */}
        <div className="flex items-center justify-between gap-3 py-1.5 pb-3.5">
          <div>
            <h2 className="m-0 text-[23px] font-bold tracking-[-0.5px] leading-tight">
              Transactions
            </h2>
            <div className="text-[12.5px] text-(--muted) mt-0.75">
              October 2026 · 46 records
            </div>
          </div>
          <IconButton
            label="Sort and filter"
            icon={<path d="M4 6h16M7 12h10M10 18h4" />}
          />
        </div>

        {/* Search */}
        <SearchBar placeholder="Search notes and descriptions" />

        {/* Filter chips */}
        <ChipStrip>
          <Chip on>All</Chip>
          <Chip>Income</Chip>
          <Chip>Expense</Chip>
          <Chip>Transfer</Chip>
          <Chip ghost>Filters</Chip>
        </ChipStrip>

        {/* Grouped transactions */}
        {GROUPS.map((g, gi) => (
          <div key={g.label} className={gi === 0 ? "mt-3" : "mt-1"}>
            <SectionLabel>{g.label}</SectionLabel>
            <div
              className="bg-white border border-(--line) rounded-[18px]
                            py-1 px-3.5"
            >
              {g.rows.map((r, ri) => (
                <TransactionRow
                  key={r.id}
                  tone={r.tone}
                  icon={r.icon}
                  title={r.title}
                  meta={r.meta}
                  amount={r.amount}
                  last={ri === g.rows.length - 1}
                />
              ))}
            </div>
          </div>
        ))}
      </ScrollArea>
      <BottomNav active="activity" />
    </PhoneFrame>
  );
}
