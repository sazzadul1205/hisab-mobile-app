import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { AppBar } from "../../components/AppBar";
import { IconButton } from "../../components/IconButton";
import { AmountInput } from "../../components/AmountInput";
import { AccountPicker } from "../../components/AccountPicker";
import { DateTimeInput } from "../../components/DateTimeInput";
import { TransactionTypeSegments } from "../../components/TransactionTypeSegments";
import { Alert } from "../../components/Alert";
import { Button, ButtonRow } from "../../components/Button";
import { Field, TextInput, MoneyInput } from "../../components/FormField";
import { BootScreen } from "../../auth/RouteGuards";
import { useAccounts } from "../../hooks/useAccounts";
import { useTransaction } from "../../hooks/useTransactions";
import { createTransfer, updateTransaction } from "../../services/transactions";
import { parseMoney, fromMinor, formatBDT } from "../../lib/money";
import { accountBalance } from "../../services/calc";
import { logger } from "../../lib/logger";

/* ================================================================
   Inner form
   ================================================================ */
function TransferForm({ id, isEdit, initial, accounts, transactions }) {
  const navigate = useNavigate();

  const [amount, setAmount] = useState(
    initial ? fromMinor(initial.amount).toFixed(2) : "",
  );
  const [fee, setFee] = useState(
    initial ? fromMinor(initial.fee ?? 0).toFixed(2) : "0.00",
  );
  const [accountId, setAccountId] = useState(
    initial?.accountId ?? accounts[0]?.id ?? "",
  );
  const [destinationAccountId, setDestinationAccountId] = useState(
    initial?.destinationAccountId ??
      accounts.find((a) => a.id !== accounts[0]?.id)?.id ??
      "",
  );
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString());
  const [note, setNote] = useState(initial?.note ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const sourceAccount = accounts.find((a) => a.id === accountId);

  const sourceBalance = useMemo(() => {
    if (!sourceAccount) return 0;
    const others = isEdit
      ? transactions.filter((t) => t.id !== id)
      : transactions;
    return accountBalance(sourceAccount, others);
  }, [sourceAccount, transactions, isEdit, id]);

  const close = () => navigate(isEdit ? `/transactions/${id}` : "/dashboard");

  const amountPaisa = parseMoney(amount) ?? 0;
  const feePaisa = parseMoney(fee) ?? 0;
  const totalDebit = amountPaisa + feePaisa;
  const overBalance = totalDebit > sourceBalance && amountPaisa > 0;

  const hint = sourceAccount
    ? feePaisa > 0
      ? `Available in ${sourceAccount.name}: ${formatBDT(sourceBalance)} · total debit ${formatBDT(totalDebit)}`
      : `Available in ${sourceAccount.name}: ${formatBDT(sourceBalance)}`
    : undefined;

  const handleSave = async () => {
    setError("");
    if (amountPaisa <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    if (feePaisa < 0) {
      setError("Fee cannot be negative.");
      return;
    }
    if (!accountId || !destinationAccountId) {
      setError("Choose both accounts.");
      return;
    }
    if (accountId === destinationAccountId) {
      setError("Source and destination must differ.");
      return;
    }
    if (overBalance) {
      setError("Total debit exceeds the source balance.");
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await updateTransaction(id, {
          amount: amountPaisa,
          fee: feePaisa,
          accountId,
          destinationAccountId,
          date,
          note,
        });
        navigate(`/transactions/${id}`, { replace: true });
      } else {
        const tx = await createTransfer({
          amount: amountPaisa,
          fee: feePaisa,
          accountId,
          destinationAccountId,
          date,
          note,
        });
        navigate(`/transactions/${tx.id}`, { replace: true });
      }
    } catch (err) {
      if (err.message === "INSUFFICIENT_BALANCE") {
        setError("Total debit exceeds the source balance.");
      } else if (err.message === "SAME_ACCOUNT") {
        setError("Source and destination must differ.");
      } else {
        logger.error(err);
        setError("Could not save. Try again.");
      }
      setSaving(false);
    }
  };

  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <AppBar
          title={isEdit ? "Edit transfer" : "New transfer"}
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

        {!isEdit && <TransactionTypeSegments active="transfer" />}

        <AmountInput value={amount} onChange={setAmount} hint={hint} />

        <Field label="From account">
          <AccountPicker
            accounts={accounts.filter((a) => !a.isArchived)}
            value={accountId}
            onChange={setAccountId}
          />
        </Field>

        <Field label="To account">
          <AccountPicker
            accounts={accounts.filter((a) => !a.isArchived)}
            value={destinationAccountId}
            onChange={setDestinationAccountId}
            exclude={accountId}
          />
        </Field>

        <Field label="Fee" hint="optional">
          <MoneyInput
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            size="sm"
          />
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
          <DateTimeInput value={date} onChange={setDate} />
        </Field>

        <Field label="Note" hint="optional">
          <TextInput
            placeholder="Moving to bKash for online payments"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </Field>

        {error && (
          <div className="text-[12px] font-semibold text-(--out) mb-3 text-center">
            {error}
          </div>
        )}
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
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Save transfer"}
          </Button>
        </ButtonRow>
      </div>
    </PhoneFrame>
  );
}

/* ================================================================
   Outer
   ================================================================ */
export default function AddTransfer({ mode = "new" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = mode === "edit";

  const { accounts, transactions, loading: aLoad } = useAccounts();
  const { transaction, loading: tLoad } = useTransaction(isEdit ? id : null);

  if (aLoad || (isEdit && tLoad)) return <BootScreen />;

  if (accounts.length < 2) {
    return (
      <PhoneFrame>
        <StatusBar />
        <ScrollArea>
          <AppBar title="New transfer" showBack={false} />
          <div className="text-center py-10 px-4">
            <b className="block text-[13.5px] font-semibold mb-2">
              Two accounts needed
            </b>
            <small className="block text-[12px] text-(--muted) mb-4 leading-[1.55]">
              Transfers move money between your own accounts. Add at least two
              accounts to get started.
            </small>
            <Button onClick={() => navigate("/accounts/new")}>
              + Add account
            </Button>
          </div>
        </ScrollArea>
      </PhoneFrame>
    );
  }

  return (
    <TransferForm
      key={isEdit ? id : "new"}
      id={id}
      isEdit={isEdit}
      initial={isEdit ? transaction : null}
      accounts={accounts}
      transactions={transactions}
    />
  );
}
