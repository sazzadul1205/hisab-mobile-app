import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { AppBar } from "../../components/AppBar";
import { SegmentedControl } from "../../components/SegmentedControl";
import { Field, TextInput } from "../../components/FormField";
import { Alert } from "../../components/Alert";
import { Note } from "../../components/Note";
import { Button, ButtonRow } from "../../components/Button";
import { BootScreen } from "../../auth/RouteGuards";
import { useCategories } from "../../hooks/useTransactions";
import { createCategory, updateCategory } from "../../services/categories";

const TYPE_LABEL = { expense: "Expense", income: "Income" };

/* ================================================================
   Inner form
   ================================================================ */
function CategoryForm({ isEdit, id, initial, initialType, fromTab }) {
  const navigate = useNavigate();

  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState(initialType);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const backTab = fromTab ?? (isEdit ? initial?.type : type) ?? "expense";
  const close = () => navigate(`/categories?tab=${backTab}`, { replace: true });

  const handleSave = async () => {
    setError("");
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Category name is required.");
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await updateCategory(id, { name: trimmed });
      } else {
        await createCategory({ name: trimmed, type });
      }
      close();
    } catch (err) {
      if (err.message === "DUPLICATE_NAME") {
        setError(`A ${type} category named "${trimmed}" already exists.`);
      } else {
        console.error(err);
        setError("Could not save. Try again.");
      }
      setSaving(false);
    }
  };

  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <AppBar title={isEdit ? "Edit category" : "New category"} />

        <Field label="Category name">
          <TextInput
            placeholder="e.g. Groceries"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>

        {isEdit ? (
          <Field label="Type">
            <div className="flex items-center justify-between bg-white border border-(--line) rounded-[14px] px-3.5 py-3.25 text-[14px] text-(--ink)">
              <span className="font-semibold">{TYPE_LABEL[initial?.type]}</span>
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

        {error && (
          <div className="text-[12px] font-semibold text-(--out) mb-3 text-center">
            {error}
          </div>
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
            : "New categories appear immediately in the transaction forms."}
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
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Save category"}
          </Button>
        </ButtonRow>
      </div>
    </PhoneFrame>
  );
}

/* ================================================================
   Outer
   ================================================================ */
export default function AddCategory({ mode = "new" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [params] = useSearchParams();
  const isEdit = mode === "edit";

  const { categories, loading } = useCategories();

  if (loading) return <BootScreen />;

  const initial = isEdit ? (categories.find((c) => c.id === id) ?? null) : null;
  const fromTab = params.get("from") ?? null;

  if (isEdit && !initial) {
    return (
      <PhoneFrame>
        <StatusBar />
        <ScrollArea>
          <AppBar title="Category" />
          <div className="text-center py-10 px-4">
            <b className="block text-[13.5px] font-semibold mb-2">
              Category not found
            </b>
            <small className="block text-[12px] text-(--muted) mb-4">
              It may have been removed.
            </small>
            <Button onClick={() => navigate("/categories")}>
              Back to categories
            </Button>
          </div>
        </ScrollArea>
      </PhoneFrame>
    );
  }

  const initialType = isEdit
    ? initial.type
    : params.get("type") === "income"
      ? "income"
      : "expense";

  return (
    <CategoryForm
      key={isEdit ? id : "new"}
      isEdit={isEdit}
      id={id}
      initial={initial}
      initialType={initialType}
      fromTab={fromTab}
    />
  );
}
