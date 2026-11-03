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

const INCOME_CATEGORIES = [
  {
    id: "salary",
    label: "Salary",
    icon: <path d="M12 4v16M8 8h6a3 3 0 0 1 0 6H8" />,
  },
  {
    id: "freelance",
    label: "Freelance",
    icon: <path d="M13 3 5 14h6l-1 7 8-11h-6z" />,
  },
  {
    id: "business",
    label: "Business",
    icon: (
      <>
        <path d="M4 5h16v14H4z" />
        <path d="M8 9h8M8 13h5" />
      </>
    ),
  },
  {
    id: "gift",
    label: "Gift",
    icon: (
      <path d="M12 3l2.5 5.5L20 9.5l-4 4 1 6-5-2.8L7 19.5l1-6-4-4 5.5-1z" />
    ),
  },
  { id: "other", label: "Other", icon: <path d="M4 12h16M12 4v16" /> },
  {
    id: "manage",
    label: "Manage",
    dashed: true,
    icon: <path d="M12 5v14M5 12h14" />,
  },
];

export default function AddIncome({ mode = "new" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = mode === "edit";
  const close = () => navigate(isEdit ? `/transactions/${id}` : "/dashboard");

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

        <AmountDisplay value="45,000.00" />

        <Field label="Destination account">
          <AccountSelect
            initial="CB"
            color="#3355C4"
            name="City Bank — Savings"
          />
        </Field>

        <Field label="Income category">
          <CategoryPicker categories={INCOME_CATEGORIES} selected="salary" />
        </Field>

        <Field label="Date & time">
          <SelectInput value="29 Oct 2026 · 8:00 AM" />
        </Field>

        <Field label="Note" hint="optional">
          <TextInput
            placeholder="October salary credit"
            defaultValue={isEdit ? "October salary credit" : undefined}
          />
        </Field>

        {isEdit && (
          <div className="text-[11.5px] leading-[1.6] text-(--muted) bg-(--app) border border-dashed border-(--line) rounded-[14px] px-3.25 py-2.75">
            Saving updates this record and recalculates all affected balances.
            The transaction type cannot be changed after creation.
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
          >
            Cancel
          </Button>
          <Button>{isEdit ? "Save changes" : "Save income"}</Button>
        </ButtonRow>
      </div>
    </PhoneFrame>
  );
}
