import { useState } from "react";
import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { AppBar } from "../../components/AppBar";
import { Field, TextInput } from "../../components/FormField";
import { Alert } from "../../components/Alert";
import { Button, ButtonRow } from "../../components/Button";
import { useAuth } from "../../auth/authContext";
import { InvalidPinError } from "../../crypto/vault";
import { wipeAllData } from "../../services/deleteAll";
import { PIN_LENGTH } from "../../constants/app";

export default function DeleteAll() {
  const { verifyPin, lock } = useAuth();

  const [pin, setPin] = useState("");
  const [deleteText, setDeleteText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    setError("");

    // Local validation — before any async crypto work
    if (pin.length !== PIN_LENGTH) {
      setError(`Enter your full ${PIN_LENGTH}-digit PIN.`);
      return;
    }
    if (deleteText !== "DELETE") {
      setError("Type DELETE exactly (all caps) to confirm.");
      return;
    }

    setBusy(true);

    // Verify PIN against the current vault. If wrong, abort — no data
    // touched. This is the "re-authentication" step SRS FR-12 demands.
    try {
      await verifyPin(pin);
    } catch (err) {
      if (err instanceof InvalidPinError) {
        setError("Incorrect PIN.");
      } else {
        console.error(err);
        setError("Could not verify PIN. Try again.");
      }
      setBusy(false);
      return;
    }

    // Wipe + lock + navigate. If the wipe succeeds, we do a full page
    // reload rather than a router navigation. Reason: AuthProvider
    // still holds status="unlocked" in memory; a soft navigation would
    // bounce back to /dashboard because RequireNoVault sees unlocked.
    // A full reload reinitializes AuthProvider, which boots into a
    // fresh DB and routes to /welcome correctly.
    try {
      lock(); // clear session DEK from memory first
      await wipeAllData();
      window.location.replace("/");
    } catch (err) {
      console.error("Wipe failed:", err);
      setError("Could not delete data. Try again.");
      setBusy(false);
    }
  };

  const canAttempt = pin.length > 0 || deleteText.length > 0;

  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <AppBar title="Delete all data" />

        <div
          className="w-16 h-16 rounded-[22px] mx-auto mt-3 mb-4.5
                     grid place-items-center bg-(--danger-soft) text-(--danger)"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-7.5 h-7.5 stroke-current fill-none stroke-[1.8]
                       [stroke-linecap:round] [stroke-linejoin:round]"
          >
            <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />
          </svg>
        </div>

        <div className="text-center mb-5">
          <h2 className="m-0 mb-2 text-[20px] font-bold tracking-[-0.4px]">
            Delete everything?
          </h2>
          <p className="m-0 mx-auto text-[13px] text-(--muted) leading-[1.6] max-w-[32ch]">
            This removes all local accounts, transactions, categories, reports,
            and settings from this device.
          </p>
        </div>

        <Alert
          tone="danger"
          className="mb-3"
          icon={
            <>
              <path d="M12 9v4" />
              <circle cx="12" cy="17" r=".6" fill="currentColor" />
              <path d="M10.3 3.9 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
            </>
          }
          title="This cannot be undone"
        >
          Have an encrypted backup first. Without one, this data is gone
          permanently.
        </Alert>

        <Field label="Re-enter your PIN to continue">
          <TextInput
            type="password"
            className="tracking-[6px]"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, "").slice(0, PIN_LENGTH));
              setError("");
            }}
            disabled={busy}
            inputMode="numeric"
            autoComplete="off"
          />
        </Field>

        <Field
          label={
            <>
              Type <b className="text-(--ink) font-bold normal-case">DELETE</b>{" "}
              to confirm
            </>
          }
        >
          <TextInput
            placeholder="DELETE"
            value={deleteText}
            onChange={(e) => {
              setDeleteText(e.target.value);
              setError("");
            }}
            disabled={busy}
            autoComplete="off"
          />
        </Field>

        {error && (
          <div className="text-[12px] font-semibold text-(--out) mb-3 text-center">
            {error}
          </div>
        )}
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
            onClick={() => window.history.back()}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={busy || !canAttempt}
          >
            {busy ? "Deleting…" : "Delete everything"}
          </Button>
        </ButtonRow>
      </div>
    </PhoneFrame>
  );
}
