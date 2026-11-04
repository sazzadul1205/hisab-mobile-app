import { useState } from "react";
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
import { createIncome, updateTransaction } from "../../services/transactions";
import { parseMoney, fromMinor } from "../../lib/money";
import { logger } from "../../lib/logger";

/* ================================================================
   Inner form — receives fully-loaded data, so all useState
   initializers can be synchronous with no effects.
   ================================================================ */
function IncomeForm({ id, isEdit, initial, accounts, categories }) {
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

  const close = () => navigate(isEdit ? `/transactions/${id}` : "/dashboard");
  const amountPaisa = parseMoney(amount);

  const handleSave = async () => {
    setError("");
    if (amountPaisa == null || amountPaisa <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    if (!accountId) {
      setError("Choose a destination account.");
      return;
    }
    if (!categoryId) {
      setError("Choose a category.");
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
        const tx = await createIncome({
          amount: amountPaisa,
          accountId,
          categoryId,
          date,
          note,
        });
        navigate(`/transactions/${tx.id}`, { replace: true });
      }
    } catch (err) {
      logger.error(err);
      setError("Could not save. Try again.");
      setSaving(false);
    }
  };

  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <AppBar
          title={isEdit ? "Edit income" : "New income"}
          subtitle="Recorded only on save"
          showBack={false}
          right={
            <IconButton
              label="Close"
              icon={<path d="M6 6l12 12M18 6L6 18" />}
              onClick={close}
            />
          }
        />

        {!isEdit && <TransactionTypeSegments active="income" />}

        <AmountInput value={amount} onChange={setAmount} />

        <Field label="Destination account">
          <AccountPicker
            accounts={accounts.filter((a) => !a.isArchived)}
            value={accountId}
            onChange={setAccountId}
          />
        </Field>

        <Field label="Income category">
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
            placeholder="October salary credit"
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
            {saving ? "Saving…" : isEdit ? "Save changes" : "Save income"}
          </Button>
        </ButtonRow>
      </div>
    </PhoneFrame>
  );
}

/* ================================================================
   Outer — handles loading only. Mounts the form once data is final.
   ================================================================ */
export default function AddIncome({ mode = "new" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = mode === "edit";

  const { accounts, loading: aLoad } = useAccounts();
  const { categories, loading: cLoad } = useCategories("income");
  const { transaction, loading: tLoad } = useTransaction(isEdit ? id : null);

  if (aLoad || cLoad || (isEdit && tLoad)) return <BootScreen />;

  if (accounts.length === 0) {
    return (
      <PhoneFrame>
        <StatusBar />
        <ScrollArea>
          <AppBar title="New income" showBack={false} />
          <div className="text-center py-10 px-4">
            <b className="block text-[13.5px] font-semibold mb-2">
              Create an account first
            </b>
            <small className="block text-[12px] text-(--muted) mb-4 leading-[1.55]">
              Income needs somewhere to land. Add a cash, wallet, or bank
              account, then come back.
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
    <IncomeForm
      key={isEdit ? id : "new"}
      id={id}
      isEdit={isEdit}
      initial={isEdit ? transaction : null}
      accounts={accounts}
      categories={categories}
    />
  );
}
