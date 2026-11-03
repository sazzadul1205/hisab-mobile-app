import { useNavigate } from "react-router-dom";
import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { AppBar } from "../../components/AppBar";
import { Field, TextInput } from "../../components/FormField";
import { Alert } from "../../components/Alert";
import { Button, ButtonRow } from "../../components/Button";

export default function DeleteAll() {
  const navigate = useNavigate();

  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <AppBar title="Delete all data" />

        {/* Danger badge */}
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

        {/* Copy */}
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
          <TextInput type="password" className="tracking-[6px]" />
        </Field>

        <Field
          label={
            <>
              Type <b className="text-(--ink) font-bold normal-case">DELETE</b>{" "}
              to confirm
            </>
          }
        >
          <TextInput placeholder="DELETE" />
        </Field>
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
            onClick={() => navigate("/settings")}
          >
            Cancel
          </Button>
          <Button variant="danger">Delete everything</Button>
        </ButtonRow>
      </div>
    </PhoneFrame>
  );
}
