import { useRef, useState } from "react";
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
import { useAccount } from "../../hooks/useAccounts";
import { createAccount, updateAccount } from "../../services/accounts";
import { parseMoney, fromMinor } from "../../lib/money";
import { ACCOUNT_TYPES } from "../../constants/app";
import { BootScreen } from "../../auth/RouteGuards";

export default function AddAccount({ mode = "new" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = mode === "edit";

  const { account, loading } = useAccount(isEdit ? id : null);

  const nameRef = useRef(null);
  const typeRef = useRef(null);
  const balanceRef = useRef(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const close = () => navigate(isEdit ? `/accounts/${id}` : "/accounts");

  if (isEdit && (loading || !account)) {
    return <BootScreen />;
  }

  // Prefill defaults
  const defaultName = isEdit ? account.name : "";
  const defaultType = isEdit ? account.type : "bank";
  const defaultBalance = isEdit
    ? fromMinor(account.openingBalance).toFixed(2)
    : "40000.00";

  const handleSave = async () => {
    setError("");
    const name = (nameRef.current?.value ?? "").trim();
    const type = typeRef.current?.value ?? defaultType;
    const balancePaisa = parseMoney(balanceRef.current?.value ?? "");

    if (!name) {
      setError("Account name is required.");
      return;
    }
    if (balancePaisa == null || balancePaisa < 0) {
      setError("Enter a valid opening balance.");
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await updateAccount(id, {
          name,
          type,
          openingBalance: balancePaisa,
        });
        navigate(`/accounts/${id}`, { replace: true });
      } else {
        const created = await createAccount({
          name,
          type,
          openingBalance: balancePaisa,
        });
        navigate(`/accounts/${created.id}`, { replace: true });
      }
    } catch (err) {
      console.error("Account save failed:", err);
      setError("Could not save. Try again.");
      setSaving(false);
    }
  };

  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <AppBar title={isEdit ? "Edit account" : "New account"} />

        <Field label="Account name">
          <TextInput
            inputRef={nameRef}
            placeholder="e.g. City Bank — Savings"
            defaultValue={defaultName}
          />
        </Field>

        <Field label="Account type">
          <SelectInput
            inputRef={typeRef}
            defaultValue={defaultType}
            options={ACCOUNT_TYPES}
          />
        </Field>

        <Field label="Opening balance">
          <MoneyInput inputRef={balanceRef} defaultValue={defaultBalance} />
        </Field>

        {error && (
          <div className="text-[12px] font-semibold text-(--out) mb-3 text-center">
            {error}
          </div>
        )}

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
            onClick={close}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Save account"}
          </Button>
        </ButtonRow>
      </div>
    </PhoneFrame>
  );
}
