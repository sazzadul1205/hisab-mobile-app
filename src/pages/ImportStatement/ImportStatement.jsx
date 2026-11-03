import { useNavigate } from "react-router-dom";
import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { AppBar } from "../../components/AppBar";
import { Button, ButtonRow } from "../../components/Button";
import { Field } from "../../components/FormField";
import { AccountSelect } from "../../components/AccountSelect";
import { Alert } from "../../components/Alert";
import { Note } from "../../components/Note";

/* ----------------------------------------------------------------
   Empty state — matches the mock's .empty block.
   Local to this page; only appears here.
   ---------------------------------------------------------------- */
function EmptyState() {
  return (
    <div className="text-center py-7 px-4">
      <div
        className="w-13 h-13 rounded-2xl mx-auto mb-3
                   grid place-items-center bg-(--app)
                   border border-dashed border-(--line)
                   text-(--muted)"
      >
        <svg
          viewBox="0 0 24 24"
          className="w-5.5 h-5.5 stroke-current fill-none stroke-[1.8]
                     [stroke-linecap:round] [stroke-linejoin:round]"
        >
          <path d="M12 15V4M8 8l4-4 4 4" />
          <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
        </svg>
      </div>
      <b className="block text-[13.5px] font-semibold mb-1.25">
        Choose a statement file
      </b>
      <small className="block text-[12px] text-(--muted) leading-[1.55]">
        Supported: bKash CSV, City Bank CSV (formats with implemented parsers
        only)
      </small>
    </div>
  );
}

export default function ImportStatement() {
  const navigate = useNavigate();

  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <AppBar title="Import statement" />

        <EmptyState />

        <Button variant="secondary" className="mt-1">
          Choose file
        </Button>

        <Field label="Destination account">
          <div className="mt-3.5">
            <AccountSelect initial="b" color="#D6336C" name="bKash" />
          </div>
        </Field>

        <Alert
          tone="info"
          icon={
            <>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4M12 16h.01" />
            </>
          }
          title="Parsed on your device"
        >
          Files are never uploaded. Your statement stays on this phone.
        </Alert>

        <Note>
          Balances do not change during parsing. You will review every parsed
          row before anything is saved.
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
          <Button onClick={() => navigate("/import/review")}>
            Parse &amp; continue
          </Button>
        </ButtonRow>
      </div>
    </PhoneFrame>
  );
}
