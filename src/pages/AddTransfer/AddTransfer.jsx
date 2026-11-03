import { useNavigate } from "react-router-dom";
import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { AppBar } from "../../components/AppBar";
import { IconButton } from "../../components/IconButton";
import { TransactionTypeSegments } from "../../components/TransactionTypeSegments";
import { AmountDisplay } from "../../components/AmountDisplay";
import { AccountSelect } from "../../components/AccountSelect";
import { Alert } from "../../components/Alert";
import { Button, ButtonRow } from "../../components/Button";
import {
  Field,
  TextInput,
  SelectInput,
  MoneyInput,
} from "../../components/FormField";

const DEMO_FEE = "25.00";
const DEMO_AMOUNT = "5,000.00";
const DEMO_AVAILABLE = "৳91,600.00";
const DEMO_TOTAL_DEBIT = "৳5,025.00";

export default function AddTransfer() {
  const navigate = useNavigate();
  const close = () => navigate("/dashboard");

  const hasFee = parseFloat(DEMO_FEE) > 0;
  const amountHint = hasFee
    ? `Available in City Bank: ${DEMO_AVAILABLE} · total debit ${DEMO_TOTAL_DEBIT}`
    : `Available in City Bank: ${DEMO_AVAILABLE}`;

  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <AppBar
          title="New transfer"
          subtitle="Between your accounts"
          showBack={false}
          right={
            <IconButton
              label="Close"
              icon={<path d="M6 6l12 12M18 6L6 18" />}
              onClick={close}
            />
          }
        />

        <TransactionTypeSegments active="transfer" />

        <AmountDisplay value={DEMO_AMOUNT} hint={amountHint} />

        <Field label="From account">
          <AccountSelect
            initial="CB"
            color="#3355C4"
            name="City Bank — Savings"
          />
        </Field>

        <Field label="To account">
          <AccountSelect initial="b" color="#D6336C" name="bKash" />
        </Field>

        <Field label="Fee" hint="optional">
          <MoneyInput defaultValue={DEMO_FEE} size="sm" />
        </Field>

        <Alert
          tone="info"
          className="mb-3.5"
          icon={<path d="M4 8h13l-3-3M20 16H7l3 3" />}
          title="One logical transfer"
        >
          Excluded from income and expense totals. Both account balances update
          together. Any fee is recorded as an expense under "Transfer fees".
        </Alert>

        <Field label="Date & time">
          <SelectInput value="29 Oct 2026 · 9:30 AM" />
        </Field>

        <Field label="Note" hint="optional">
          <TextInput placeholder="Moving to bKash for online payments" />
        </Field>
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
            onClick={close}
          >
            Cancel
          </Button>
          <Button>Save transfer</Button>
        </ButtonRow>
      </div>
    </PhoneFrame>
  );
}
