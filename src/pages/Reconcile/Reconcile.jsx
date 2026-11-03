import { useParams } from "react-router-dom";
import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { AppBar } from "../../components/AppBar";
import {
  Field,
  TextInput,
  SelectInput,
  MoneyInput,
} from "../../components/FormField";
import { AccountSelect } from "../../components/AccountSelect";
import { Alert } from "../../components/Alert";
import { Button } from "../../components/Button";

/* ----------------------------------------------------------------
   Recon panel — calculated vs actual side-by-side
   ---------------------------------------------------------------- */
function ReconPanel({ calculated, actual }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 mb-3">
      <div className="bg-white border border-(--line) rounded-[14px] p-3">
        <small className="block text-[10.5px] text-(--muted) font-semibold uppercase tracking-wider">
          Calculated
        </small>
        <b className="block text-[17px] font-bold tracking-[-0.4px] num mt-1.25 text-(--ink)">
          {calculated}
        </b>
      </div>
      <div className="bg-white border border-(--line) rounded-[14px] p-3">
        <small className="block text-[10.5px] text-(--muted) font-semibold uppercase tracking-wider">
          Actual (you enter)
        </small>
        <b className="block text-[17px] font-bold tracking-[-0.4px] num mt-1.25 text-(--brand)">
          {actual}
        </b>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
   Diff tile — amber callout showing the difference
   ---------------------------------------------------------------- */
function DiffTile({ value }) {
  return (
    <div
      className="rounded-[14px] p-3.5 text-center mb-3"
      style={{
        background: "var(--warn-soft)",
        border: "1px solid #F0DDB8",
      }}
    >
      <small className="block text-[11px] text-(--warn) font-bold uppercase tracking-[0.06em]">
        Difference
      </small>
      <b className="block text-[24px] font-bold tracking-[-0.6px] num text-(--warn) mt-1">
        {value}
      </b>
    </div>
  );
}

/* ----------------------------------------------------------------
   Page
   ---------------------------------------------------------------- */
export default function Reconcile() {
  // eslint-disable-next-line no-unused-vars
  const { id } = useParams();

  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <AppBar title="Reconcile" />

        <Field label="Account">
          <AccountSelect initial="C" color="#0E7C5A" name="Cash" />
        </Field>

        <ReconPanel calculated="৳8,250.00" actual="৳8,200.00" />
        <DiffTile value="−৳50.00" />

        <Field label="Actual balance">
          <MoneyInput defaultValue="8,200.00" />
        </Field>

        <Field label="Reconciliation date">
          <SelectInput value="29 Oct 2026" />
        </Field>

        <Field label="Note" hint="optional">
          <TextInput placeholder="Likely unrecorded snack purchase" />
        </Field>

        <Alert
          tone="warn"
          icon={
            <>
              <path d="M12 9v4" />
              <circle cx="12" cy="17" r=".6" fill="currentColor" />
              <path d="M10.3 3.9 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
            </>
          }
          title="Reconciliation records a snapshot"
        >
          No transaction is added or edited. Difference is stored for later
          reference only.
        </Alert>
      </ScrollArea>

      <div
        className="flex-none px-4.5 pt-3
                   pb-[calc(20px+env(safe-area-inset-bottom))] md:pb-5"
        style={{
          background:
            "linear-gradient(180deg, rgba(247,249,248,0) 0%, var(--app) 34%)",
        }}
      >
        <Button>Save reconciliation</Button>
      </div>
    </PhoneFrame>
  );
}
