import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { AppBar } from "../../components/AppBar";
import { IconButton } from "../../components/IconButton";
import { AmountInput } from "../../components/AmountInput";
import { AccountPicker } from "../../components/AccountPicker";
import { CategoryGrid } from "../../components/CategoryGrid";
import { DateTimeInput } from "../../components/DateTimeInput";
import { TransactionTypeSegments } from "../../components/TransactionTypeSegments";
import { Button, ButtonRow } from "../../components/Button";
import { Field, TextInput } from "../../components/FormField";
import { BootScreen } from "../../auth/RouteGuards";
import { useAccounts } from "../../hooks/useAccounts";
import { useCategories, useTransaction } from "../../hooks/useTransactions";
import { createExpense, updateTransaction } from "../../services/transactions";
import { parseMoney, fromMinor, formatBDT } from "../../lib/money";
import { accountBalance } from "../../services/calc";
import { logger } from "../../lib/logger";

/* ================================================================
   Inner form
   ================================================================ */
function ExpenseForm({
  id,
  isEdit,
  initial,
  accounts,
  transactions,
  categories,
}) {
  const navigate = useNavigate();

  const [amount, setAmount] = useState(
    initial ? fromMinor(initial.amount).toFixed(2) : "",
  );
  const [accountId, setAccountId] = useState(
    initial?.accountId ?? accounts[0]?.id ?? "",
  );
  const [categoryId, setCategoryId] = useState(
    initial?.categoryId ?? categories[0]?.id ?? "",
  );
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString());
  const [note, setNote] = useState(initial?.note ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const sourceAccount = accounts.find((a) => a.id === accountId);

  const availableBalance = useMemo(() => {
    if (!sourceAccount) return 0;
    const others = isEdit
      ? transactions.filter((t) => t.id !== id)
      : transactions;
    return accountBalance(sourceAccount, others);
  }, [sourceAccount, transactions, isEdit, id]);

  const close = () => navigate(isEdit ? `/transactions/${id}` : "/dashboard");

  const amountPaisa = parseMoney(amount);
  const overBalance =
    amountPaisa != null &&
    amountPaisa > availableBalance &&
    sourceAccount != null;

  const handleSave = async () => {
    setError("");
    if (amountPaisa == null || amountPaisa <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    if (!accountId) {
      setError("Choose a source account.");
      return;
    }
    if (!categoryId) {
      setError("Choose a category.");
      return;
    }
    if (overBalance) {
      setError("Amount exceeds the account balance.");
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await updateTransaction(id, {
          amount: amountPaisa,
          accountId,
          categoryId,
          date,
          note,
        });
        navigate(`/transactions/${id}`, { replace: true });
      } else {
        const tx = await createExpense({
          amount: amountPaisa,
          accountId,
          categoryId,
          date,
          note,
        });
        navigate(`/transactions/${tx.id}`, { replace: true });
      }
    } catch (err) {
      if (err.message === "INSUFFICIENT_BALANCE") {
        setError("Amount exceeds the account balance.");
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
          title={isEdit ? "Edit expense" : "New expense"}
          subtitle="Saved only on confirm"
          showBack={false}
          right={
            <IconButton
              label="Close"
              icon={<path d="M6 6l12 12M18 6L6 18" />}
              onClick={close}
            />
          }
        />

        <div className="stagger">
        {!isEdit && <TransactionTypeSegments active="expense" />}

        <AmountInput
          value={amount}
          onChange={setAmount}
          autoFocus
          hint={
            sourceAccount
              ? `Available in ${sourceAccount.name}: ${formatBDT(availableBalance)}`
              : undefined
          }
        />

        <Field label="Source account">
          <AccountPicker
            accounts={accounts.filter((a) => !a.isArchived)}
            value={accountId}
            onChange={setAccountId}
          />
        </Field>

        <Field label="Expense category">
          <CategoryGrid
            categories={categories}
            selected={categoryId}
            onSelect={setCategoryId}
          />
        </Field>

        <Field label="Date & time">
          <DateTimeInput value={date} onChange={setDate} />
        </Field>

        <Field label="Note" hint="optional">
          <TextInput
            placeholder="Weekly groceries — Karwan Bazar"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </Field>

        {overBalance && !error && (
          <div className="text-[12px] font-semibold text-(--out) mb-3 text-center">
            Amount exceeds available balance.
          </div>
        )}
        {error && (
          <div className="text-[12px] font-semibold text-(--out) mb-3 text-center">
            {error}
          </div>
        )}

        <div className="text-[11.5px] leading-[1.6] text-(--muted) bg-(--app) border border-dashed border-(--line) rounded-[14px] px-3.25 py-2.75">
          Amount must be positive and must not exceed the source account
          balance. Overdrafts are blocked.
        </div>
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
            onClick={close}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Save expense"}
          </Button>
        </ButtonRow>
      </div>
    </PhoneFrame>
  );
}

/* ================================================================
   Outer
   ================================================================ */
export default function AddExpense({ mode = "new" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = mode === "edit";

  const { accounts, transactions, loading: aLoad } = useAccounts();
  const { categories, loading: cLoad } = useCategories("expense");
  const { transaction, loading: tLoad } = useTransaction(isEdit ? id : null);

  if (aLoad || cLoad || (isEdit && tLoad)) return <BootScreen />;

  if (accounts.length === 0) {
    return (
      <PhoneFrame>
        <StatusBar />
        <ScrollArea>
          <AppBar title="New expense" showBack={false} />
          <div className="text-center py-10 px-4">
            <b className="block text-[13.5px] font-semibold mb-2">
              Create an account first
            </b>
            <small className="block text-[12px] text-(--muted) mb-4 leading-[1.55]">
              Expenses need a source account. Add one, then come back.
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
    <ExpenseForm
      key={isEdit ? id : "new"}
      id={id}
      isEdit={isEdit}
      initial={isEdit ? transaction : null}
      accounts={accounts}
      transactions={transactions}
      categories={categories}
    />
  );
}
