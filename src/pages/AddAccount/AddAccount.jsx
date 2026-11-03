import { useNavigate, useParams } from "react-router-dom";
import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { AppBar } from "../../components/AppBar";
import { Alert } from "../../components/Alert";
import { Button, ButtonRow } from "../../components/Button";
import {
  Field,
  TextInput,
  SelectInput,
  MoneyInput,
} from "../../components/FormField";

const DEMO_ACCOUNT = {
  name: "City Bank — Savings",
  type: "Bank account",
  openingBalance: "40,000.00",
};

export default function AddAccount({ mode = "new" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = mode === "edit";

  const close = () => navigate(isEdit ? `/accounts/${id}` : "/accounts");
  const cancel = close;

  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <AppBar title={isEdit ? "Edit account" : "New account"} />

        <Field label="Account name">
          <TextInput
            placeholder="e.g. City Bank — Savings"
            defaultValue={isEdit ? DEMO_ACCOUNT.name : undefined}
          />
        </Field>

        <Field label="Account type">
          <SelectInput value={isEdit ? DEMO_ACCOUNT.type : "Bank account"} />
        </Field>

        <Field label="Opening balance">
          <MoneyInput
            defaultValue={isEdit ? DEMO_ACCOUNT.openingBalance : "40,000.00"}
          />
        </Field>

        <Alert
          tone="info"
          icon={
            <>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4M12 16h.01" />
            </>
          }
          title="Opening balance editing"
        >
          Editing an existing account's opening balance can confuse historical
          balances — an adjustment will be logged if changed later.
        </Alert>

        <div className="text-[11.5px] leading-[1.6] text-(--muted) bg-(--app) border border-dashed border-(--line) rounded-[14px] px-3.25 py-2.75 mt-3">
          {isEdit
            ? "Only the fields you change will be updated. Transaction history is never rewritten."
            : "Prevent accidental duplicate submissions. Name is required and balance uses an exact money representation."}
        </div>
      </ScrollArea>

      <div
        className="flex-none px-4.5 pt-3 pb-[calc(20px+env(safe-area-inset-bottom))] md:pb-5"
        style={{
          background:
            "linear-gradient(180deg, rgba(247,249,248,0) 0%, var(--app) 34%)",
        }}
      >
        <ButtonRow>
          <Button
            variant="secondary"
            className="flex-[0_0_34%]"
            onClick={cancel}
          >
            Cancel
          </Button>
          <Button>{isEdit ? "Save changes" : "Save account"}</Button>
        </ButtonRow>
      </div>
    </PhoneFrame>
  );
}
