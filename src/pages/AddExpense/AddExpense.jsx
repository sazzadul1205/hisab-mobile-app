import { useNavigate, useParams } from "react-router-dom";
import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { AppBar } from "../../components/AppBar";
import { IconButton } from "../../components/IconButton";
import { TransactionTypeSegments } from "../../components/TransactionTypeSegments";
import { AmountDisplay } from "../../components/AmountDisplay";
import { AccountSelect } from "../../components/AccountSelect";
import { CategoryPicker } from "../../components/CategoryPicker";
import { Button, ButtonRow } from "../../components/Button";
import { Field, TextInput, SelectInput } from "../../components/FormField";

const EXPENSE_CATEGORIES = [
  {
    id: "groceries",
    label: "Groceries",
    icon: (
      <>
        <path d="M6 7h12l-1 13H7z" />
        <path d="M9 7V5a3 3 0 0 1 6 0v2" />
      </>
    ),
  },
  {
    id: "bills",
    label: "Bills",
    icon: (
      <>
        <path d="M4 6h16v12H4z" />
        <path d="M4 11h16" />
      </>
    ),
  },
  {
    id: "transport",
    label: "Transport",
    icon: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l3 2" />
      </>
    ),
  },
  {
    id: "rent",
    label: "Rent",
    icon: (
      <>
        <path d="M4 20V9l8-5 8 5v11" />
        <path d="M9 20v-6h6v6" />
      </>
    ),
  },
  {
    id: "food",
    label: "Food",
    icon: <path d="M12 4v16M8 8h6a3 3 0 0 1 0 6H8" />,
  },
  {
    id: "health",
    label: "Health",
    icon: (
      <>
        <path d="M4 5h16v14H4z" />
        <path d="M8 9h8M8 13h5" />
      </>
    ),
  },
  {
    id: "other",
    label: "Other",
    icon: (
      <path d="M12 3l2.5 5.5L20 9.5l-4 4 1 6-5-2.8L7 19.5l1-6-4-4 5.5-1z" />
    ),
  },
  {
    id: "manage",
    label: "Manage",
    dashed: true,
    icon: <path d="M12 5v14M5 12h14" />,
  },
];

export default function AddExpense({ mode = "new" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = mode === "edit";
  const close = () => navigate(isEdit ? `/transactions/${id}` : "/dashboard");

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

        {!isEdit && <TransactionTypeSegments active="expense" />}

        <AmountDisplay value="850.00" hint="Available in Cash: ৳8,250.00" />

        <Field label="Source account">
          <AccountSelect initial="C" color="#0E7C5A" name="Cash" />
        </Field>

        <Field label="Expense category">
          <CategoryPicker
            categories={EXPENSE_CATEGORIES}
            selected="groceries"
          />
        </Field>

        <Field label="Date & time">
          <SelectInput value="29 Oct 2026 · 9:12 AM" />
        </Field>

        <Field label="Note" hint="optional">
          <TextInput
            placeholder="Weekly groceries — Karwan Bazar"
            defaultValue={
              isEdit ? "Weekly groceries — Karwan Bazar" : undefined
            }
          />
        </Field>

        <div className="text-[11.5px] leading-[1.6] text-(--muted) bg-(--app) border border-dashed border-(--line) rounded-[14px] px-3.25 py-2.75">
          {isEdit
            ? "Saving updates this record and recalculates the source account balance. Errors appear directly beneath the field."
            : "Validation: amount must be positive and must not exceed the source account balance. Errors appear directly beneath the field."}
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
          >
            Cancel
          </Button>
          <Button>{isEdit ? "Save changes" : "Save expense"}</Button>
        </ButtonRow>
      </div>
    </PhoneFrame>
  );
}
