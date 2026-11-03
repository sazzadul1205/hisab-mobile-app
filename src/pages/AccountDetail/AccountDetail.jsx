import { useParams } from "react-router-dom";
import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { AppBar } from "../../components/AppBar";
import { IconButton } from "../../components/IconButton";
import { SectionLabel } from "../../components/SectionLabel";
import { TransactionRow } from "../../components/TransactionRow";
import { Chip, ChipStrip } from "../../components/Chip";
import { Note } from "../../components/Note";
import { Button } from "../../components/Button";

export default function AccountDetail() {
  // Reserved for later — same component will serve all accounts when data is wired.
  // eslint-disable-next-line no-unused-vars
  const { id } = useParams();

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
            />
          }
        />

        {/* Hero */}
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

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2.5 mt-3">
          <Button variant="secondary" size="sm">
            Reconcile
          </Button>
          <Button variant="secondary" size="sm">
            Archive
          </Button>
        </div>

        {/* Filter chips */}
        <div className="mt-3.5">
          <ChipStrip>
            <Chip on>All</Chip>
            <Chip>Income</Chip>
            <Chip>Expense</Chip>
            <Chip>Transfer</Chip>
            <Chip ghost>Date range</Chip>
          </ChipStrip>
        </div>

        {/* Today */}
        <SectionLabel className="mt-5">Today</SectionLabel>
        <div className="bg-white border border-(--line) rounded-[18px] py-1 px-3.5">
          <TransactionRow
            tone="in"
            icon={<path d="M12 4v16M8 8h6a3 3 0 0 1 0 6H8" />}
            title="Salary — October"
            meta="Income · Today 8:00 AM"
            amount="+৳45,000.00"
          />
          <TransactionRow
            tone="tr"
            icon={<path d="M4 8h13l-3-3M20 16H7l3 3" />}
            title="Transfer to bKash"
            meta="Transfer · Today 9:30 AM"
            amount="৳5,000.00"
            last
          />
        </div>

        {/* 28 Oct */}
        <SectionLabel>28 Oct</SectionLabel>
        <div className="bg-white border border-(--line) rounded-[18px] py-1 px-3.5">
          <TransactionRow
            tone="out"
            icon={
              <>
                <path d="M5 12h14" />
                <circle cx="12" cy="12" r="9" />
              </>
            }
            title="Internet bill"
            meta="Utilities · Yesterday"
            amount="−৳1,200.00"
            last
          />
        </div>

        <Note>
          Archived accounts remain viewable for historical reference; archiving
          never deletes data.
        </Note>
      </ScrollArea>
    </PhoneFrame>
  );
}
