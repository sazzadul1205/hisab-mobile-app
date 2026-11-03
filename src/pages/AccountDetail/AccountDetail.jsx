import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { AppBar } from "../../components/AppBar";
import { IconButton } from "../../components/IconButton";
import { SectionLabel } from "../../components/SectionLabel";
import { TransactionRow } from "../../components/TransactionRow";
import { Chip, ChipStrip } from "../../components/Chip";
import { Note } from "../../components/Note";
import { Button } from "../../components/Button";

const GROUPS = [
  {
    label: "Today",
    rows: [
      {
        id: "a1",
        tone: "in",
        icon: <path d="M12 4v16M8 8h6a3 3 0 0 1 0 6H8" />,
        title: "Salary — October",
        meta: "Income · Today 8:00 AM",
        amount: "+৳45,000.00",
      },
      {
        id: "a2",
        tone: "tr",
        icon: <path d="M4 8h13l-3-3M20 16H7l3 3" />,
        title: "Transfer to bKash",
        meta: "Transfer · Today 9:30 AM",
        amount: "৳5,000.00",
      },
    ],
  },
  {
    label: "28 Oct",
    rows: [
      {
        id: "a3",
        tone: "out",
        icon: (
          <>
            <path d="M5 12h14" />
            <circle cx="12" cy="12" r="9" />
          </>
        ),
        title: "Internet bill",
        meta: "Utilities · Yesterday",
        amount: "−৳1,200.00",
      },
    ],
  },
];

const TONE_TO_TYPE = { in: "income", out: "expense", tr: "transfer" };

const FILTERS = [
  { value: "all", label: "All" },
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
  { value: "transfer", label: "Transfer" },
];

export default function AccountDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const openDetail = (txId) => navigate(`/transactions/${txId}`);
  const [activeType, setActiveType] = useState("all");

  const filteredGroups = GROUPS.map((g) => ({
    ...g,
    rows:
      activeType === "all"
        ? g.rows
        : g.rows.filter((r) => TONE_TO_TYPE[r.tone] === activeType),
  })).filter((g) => g.rows.length > 0);

  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <AppBar
          title="City Bank — Savings"
          subtitle="Bank account · active"
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

        <div
          className="rounded-[18px] p-5 text-white"
          style={{ background: "linear-gradient(150deg, #118A64, #0A5A41)" }}
        >
          <div className="text-[11.5px] font-semibold tracking-[0.06em] uppercase text-white/70">
            Calculated balance
          </div>
          <div className="num text-[29px] font-bold tracking-[-1px] mt-1.5">
            ৳91,600.00
          </div>
          <div className="text-[11.5px] text-white/65 mt-1">
            Opening ৳40,000.00 · 12 transactions
          </div>
        </div>

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

        {filteredGroups.map((g, gi) => (
          <div key={g.label}>
            <SectionLabel className={gi === 0 ? "mt-5" : ""}>
              {g.label}
            </SectionLabel>
            <div className="bg-white border border-(--line) rounded-[18px] py-1 px-3.5">
              {g.rows.map((r, ri) => (
                <TransactionRow
                  key={r.id}
                  tone={r.tone}
                  icon={r.icon}
                  title={r.title}
                  meta={r.meta}
                  amount={r.amount}
                  last={ri === g.rows.length - 1}
                  onClick={() => openDetail(r.id)}
                />
              ))}
            </div>
          </div>
        ))}

        <Note>
          Archived accounts remain viewable for historical reference; archiving
          never deletes data.
        </Note>
      </ScrollArea>
    </PhoneFrame>
  );
}
