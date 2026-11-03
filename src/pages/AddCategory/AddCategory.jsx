import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { AppBar } from "../../components/AppBar";
import { SegmentedControl } from "../../components/SegmentedControl";
import { Field, TextInput } from "../../components/FormField";
import { Alert } from "../../components/Alert";
import { Note } from "../../components/Note";
import { Button, ButtonRow } from "../../components/Button";

// Demo category — replaced by a store lookup when the DB wires in
const DEMO_CATEGORY = {
  name: "Groceries",
  type: "expense",
};

const TYPE_LABEL = { expense: "Expense", income: "Income" };

export default function AddCategory({ mode = "new" }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const isEdit = mode === "edit";

  const initialType = isEdit
    ? DEMO_CATEGORY.type
    : params.get("type") === "income"
      ? "income"
      : "expense";

  const [type, setType] = useState(initialType);

  const close = () => navigate("/categories");

  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <AppBar title={isEdit ? "Edit category" : "New category"} />

        <Field label="Category name">
          <TextInput
            placeholder="e.g. Groceries"
            defaultValue={isEdit ? DEMO_CATEGORY.name : undefined}
          />
        </Field>

        {isEdit ? (
          <Field label="Type">
            <div
              className="flex items-center justify-between bg-white border
                         border-(--line) rounded-[14px] px-3.5 py-3.25
                         text-[14px] text-(--ink)"
            >
              <span className="font-semibold">
                {TYPE_LABEL[DEMO_CATEGORY.type]}
              </span>
              <span className="text-[10.5px] font-bold tracking-wider uppercase text-(--muted)">
                Locked
              </span>
            </div>
          </Field>
        ) : (
          <Field label="Type">
            <SegmentedControl
              value={type}
              options={[
                { value: "expense", label: "Expense" },
                { value: "income", label: "Income" },
              ]}
              onChange={setType}
            />
          </Field>
        )}

        <Alert
          tone="info"
          className="mb-3"
          icon={
            <>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4M12 16h.01" />
            </>
          }
          title="Type is fixed after creation"
        >
          Expense and income categories are separate. A category cannot be moved
          between types.
        </Alert>

        <Note>
          {isEdit
            ? "Renaming is safe. Existing transactions keep their category link."
            : "Default categories are seeded with the app. New categories you add here can be renamed or deleted."}
        </Note>
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
          <Button>{isEdit ? "Save changes" : "Save category"}</Button>
        </ButtonRow>
      </div>
    </PhoneFrame>
  );
}
