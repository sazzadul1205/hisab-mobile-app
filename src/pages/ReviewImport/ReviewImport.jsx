import { useNavigate } from "react-router-dom";
import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { AppBar } from "../../components/AppBar";
import { Chip, ChipStrip } from "../../components/Chip";
import { StatusPill } from "../../components/StatusPill";
import { Note } from "../../components/Note";
import { Button, ButtonRow } from "../../components/Button";

/* ----------------------------------------------------------------
   Import checkbox — visual state only, no toggle on click yet
   ---------------------------------------------------------------- */
function ImportCheckbox({ checked, dashed = false }) {
  if (checked) {
    return (
      <button
        type="button"
        aria-label="Included"
        className="w-4.75 h-4.75 rounded-md flex-none mt-0.5
                   bg-(--brand) border border-(--brand)
                   grid place-items-center cursor-pointer"
      >
        <svg
          viewBox="0 0 24 24"
          className="w-2.75 h-2.75 stroke-white fill-none stroke-3
                     [stroke-linecap:round] [stroke-linejoin:round]"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </button>
    );
  }
  return (
    <button
      type="button"
      aria-label="Excluded"
      className={
        "w-4.75 h-4.75 rounded-md flex-none mt-0.5 cursor-pointer " +
        (dashed
          ? "bg-(--app) border border-dashed border-[#C9D4CF]"
          : "bg-white border border-[#C9D4CF]")
      }
    />
  );
}

/* ----------------------------------------------------------------
   Summary strip — Parsed / Flagged / Invalid
   ---------------------------------------------------------------- */
function ImportSummaryStrip({ parsed, flagged, invalid }) {
  const cell =
    "text-center py-[13px] px-2 " +
    "border-r border-[var(--line-2)] last:border-r-0";
  const label =
    "block text-[10.5px] text-[var(--muted)] mt-[3px] font-semibold " +
    "uppercase tracking-[0.05em]";
  const num = "block text-[17px] font-bold tracking-[-0.4px] num";

  return (
    <div
      className="grid grid-cols-3 bg-white border border-(--line)
                    rounded-[14px] overflow-hidden mb-3.5"
    >
      <div className={cell}>
        <b className={`${num} text-(--ink)`}>{parsed}</b>
        <small className={label}>Parsed</small>
      </div>
      <div className={cell}>
        <b className={`${num} text-(--warn)`}>{flagged}</b>
        <small className={label}>Flagged</small>
      </div>
      <div className={cell}>
        <b className={`${num} text-(--out)`}>{invalid}</b>
        <small className={label}>Invalid</small>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
   Import row
   tags: array of { tone?, label, dashed? }
   ---------------------------------------------------------------- */
const AMOUNT_COLOR = {
  in: "text-[var(--in)]",
  out: "text-[var(--out)]",
  ink: "text-[var(--ink)]",
  muted: "text-[var(--muted)]",
};

function ImportRow({
  checked,
  dashed = false,
  title,
  subtitle,
  tags = [],
  amount,
  amountTone = "ink",
}) {
  return (
    <div
      className="flex items-start gap-2.75 py-3
                    border-b border-(--line-2) last:border-b-0"
    >
      <ImportCheckbox checked={checked} dashed={dashed} />
      <div className="flex-1 min-w-0">
        <b
          className={
            "block text-[13px] font-semibold tracking-[-0.1px] " +
            (dashed ? "text-(--muted)" : "text-(--ink)")
          }
        >
          {title}
        </b>
        <small
          className={
            "block text-[11.5px] mt-0.75 " +
            (dashed ? "text-(--out)" : "text-(--muted)")
          }
        >
          {subtitle}
        </small>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1.75">
            {tags.map((t, i) =>
              t.dashed ? (
                <button
                  key={i}
                  type="button"
                  className="text-[10.5px] font-bold px-2 py-0.75 rounded-full
                             bg-(--app) text-(--muted)
                             border border-dashed border-(--line)
                             cursor-pointer font-[inherit]"
                >
                  {t.label}
                </button>
              ) : (
                <StatusPill key={i} tone={t.tone ?? "neutral"}>
                  {t.label}
                </StatusPill>
              ),
            )}
          </div>
        )}
      </div>
      <div
        className={
          "text-[13px] font-bold num whitespace-nowrap mt-0.5 " +
          "tracking-[-0.2px] " +
          AMOUNT_COLOR[amountTone]
        }
      >
        {amount}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
   Demo parsed rows — matches the mock
   ---------------------------------------------------------------- */
const ROWS = [
  {
    id: 1,
    checked: true,
    title: "Received from 01712-XXXXXX",
    subtitle: "28 Oct 2026 · 4:12 PM · bKash",
    tags: [
      { tone: "ok", label: "Income · mapped" },
      { tone: "neutral", label: "Side income" },
    ],
    amount: "+৳8,000.00",
    amountTone: "in",
  },
  {
    id: 2,
    checked: true,
    title: "Payment to DESCO",
    subtitle: "28 Oct 2026 · 11:02 AM · bKash",
    tags: [
      { tone: "ok", label: "Expense · mapped" },
      { tone: "neutral", label: "Utilities" },
    ],
    amount: "−৳1,850.00",
    amountTone: "out",
  },
  {
    id: 3,
    checked: true,
    title: "Mobile recharge",
    subtitle: "27 Oct 2026 · 8:40 PM · bKash",
    tags: [
      { tone: "warn", label: "Possible duplicate" },
      { tone: "neutral", label: "Utilities" },
    ],
    amount: "−৳550.00",
    amountTone: "out",
  },
  {
    id: 4,
    checked: false,
    dashed: true,
    title: "Unrecognized row",
    subtitle: "Amount could not be parsed — row skipped",
    tags: [{ tone: "danger", label: "Invalid" }],
    amount: "—",
    amountTone: "muted",
  },
  {
    id: 5,
    checked: true,
    title: "Cash out",
    subtitle: "26 Oct 2026 · 6:15 PM · bKash",
    tags: [
      { tone: "ok", label: "Expense · mapped" },
      { dashed: true, label: "+ Choose category" },
    ],
    amount: "−৳2,000.00",
    amountTone: "out",
  },
];

/* ----------------------------------------------------------------
   Page
   ---------------------------------------------------------------- */
export default function ReviewImport() {
  const navigate = useNavigate();

  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <AppBar
          title="Review import"
          subtitle="bKash statement → bKash account"
        />

        <ImportSummaryStrip parsed={42} flagged={3} invalid={2} />

        <ChipStrip>
          <Chip on>All 42</Chip>
          <Chip>Needs review 5</Chip>
          <Chip>Included 38</Chip>
        </ChipStrip>

        <div
          className="bg-white border border-(--line) rounded-[18px]
                        py-1 px-3.5 mt-3"
        >
          {ROWS.map((r) => (
            <ImportRow
              key={r.id}
              checked={r.checked}
              dashed={r.dashed}
              title={r.title}
              subtitle={r.subtitle}
              tags={r.tags}
              amount={r.amount}
              amountTone={r.amountTone}
            />
          ))}
        </div>

        <Note>
          <b className="text-(--ink-2) font-semibold">Safety:</b> parsed
          rows live in memory only. Cancel or failure leaves zero partial
          transactions in local storage.
        </Note>
      </ScrollArea>

      <div
        className="flex-none px-4.5 pt-3
                   pb-[calc(20px+env(safe-area-inset-bottom))] md:pb-5"
        style={{
          background:
            "linear-gradient(180deg, rgba(247,249,248,0) 0%, var(--app) 34%)",
        }}
      >
        <ButtonRow>
          <Button
            variant="secondary"
            className="flex-[0_0_34%]"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button>Confirm import · 38</Button>
        </ButtonRow>
      </div>
    </PhoneFrame>
  );
}
