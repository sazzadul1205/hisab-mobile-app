import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { AppBar } from "../../components/AppBar";
import { AmountInput } from "../../components/AmountInput";
import { CategoryPicker } from "../../components/CategoryPicker";
import { Button, ButtonRow } from "../../components/Button";
import { Field } from "../../components/FormField";
import { BootScreen } from "../../auth/RouteGuards";
import { useCategories } from "../../hooks/useTransactions";
import { useBudget } from "../../hooks/useBudgets";
import { createBudget, updateBudget } from "../../services/budgets";
import { parseMoney, fromMinor } from "../../lib/money";
import { BUDGET_TYPES, BUDGET_TYPE_LABELS, BUDGET_PERIODS, PERIOD_LABELS, getPeriodKey } from "../../services/budgets";

function BudgetForm({
    id,
    isEdit,
    initial,
    categories,
}) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const urlPeriod = searchParams.get("period") || BUDGET_PERIODS.daily;
    const urlPeriodKey = searchParams.get("periodKey") || null;

    const [categoryId, setCategoryId] = useState(
        initial?.categoryId ?? categories[0]?.id ?? "",
    );
    const [limitAmount, setLimitAmount] = useState(
        initial ? fromMinor(initial.limitAmount).toFixed(2) : "",
    );
    const [period, setPeriod] = useState(initial?.period ?? urlPeriod);
    const [budgetType, setBudgetType] = useState(initial?.budgetType ?? BUDGET_TYPES.recurring);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const expenseCategories = categories.filter((c) => c.type === "expense");

    const budgetTypeOptions = [
        { value: BUDGET_TYPES.recurring, label: BUDGET_TYPE_LABELS.recurring, desc: "Repeats every period" },
        { value: BUDGET_TYPES.onetime, label: BUDGET_TYPE_LABELS.onetime, desc: "Only for this period" },
    ];

    const periodOptions = [
        { value: BUDGET_PERIODS.daily, label: PERIOD_LABELS.daily },
        { value: BUDGET_PERIODS.weekly, label: PERIOD_LABELS.weekly },
        { value: BUDGET_PERIODS.monthly, label: PERIOD_LABELS.monthly },
    ];

    const periodLabel = periodOptions.find(p => p.value === period)?.label ?? PERIOD_LABELS.monthly;

    const close = () => navigate(isEdit ? `/budgets/${id}` : "/budgets");

    const amountPaisa = parseMoney(limitAmount);

    const handleSave = async () => {
        setError("");
        if (amountPaisa == null || amountPaisa <= 0) {
            setError("Enter a valid amount.");
            return;
        }
        if (!categoryId) {
            setError("Choose a category.");
            return;
        }
        if (!period) {
            setError("Choose a period.");
            return;
        }
        if (!budgetType) {
            setError("Choose a budget type.");
            return;
        }

        const periodKey = urlPeriodKey ?? getPeriodKey(new Date(), period);

        setSaving(true);
        try {
            if (isEdit) {
                await updateBudget(id, { categoryId, limitAmount: amountPaisa, period, periodKey, budgetType });
            } else {
                await createBudget({ categoryId, limitAmount: amountPaisa, period, periodKey, budgetType });
            }
            close();
        } catch (err) {
            if (err.message === "BUDGET_EXISTS") {
                setError("A budget for this category and period already exists");
            } else if (err.message === "LIMIT_INVALID") {
                setError("Amount must be a positive number");
            } else if (err.message === "BUDGET_TYPE_REQUIRED") {
                setError("Please select a budget type");
            } else {
                setError("Failed to save budget");
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <PhoneFrame>
            <StatusBar />
            <AppBar title={isEdit ? "Edit budget" : "Add budget"} showBack={false} onBack={close} />
            <ScrollArea>
                <div className="p-4 space-y-4">
                    <Field label="Category">
                        <CategoryPicker
                            categories={expenseCategories}
                            value={categoryId}
                            onChange={setCategoryId}
                            placeholder="Select expense category"
                        />
                    </Field>

                    {!isEdit && (
                        <Field label="Budget Type">
                            <div className="grid grid-cols-2 gap-3">
                                {budgetTypeOptions.map((bt) => (
                                    <button
                                        key={bt.value}
                                        type="button"
                                        onClick={() => setBudgetType(bt.value)}
                                        className={`p-3 rounded-xl text-left transition-all ${
                                            budgetType === bt.value
                                                ? "bg-[var(--brand-soft)] border-2 border-[var(--brand)]"
                                                : "bg-(--card) border-2 border-(--line) hover:border-(--brand)"
                                        }`}
                                    >
                                        <div className={`text-[13px] font-bold ${budgetType === bt.value ? "text-[var(--brand-dk)]" : "text-(--ink)"}`}>
                                            {bt.label}
                                        </div>
                                        <div className="text-[10px] text-(--muted) mt-0.5">
                                            {bt.desc}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </Field>
                    )}

                    <Field label="Period">
                        <div className="flex gap-2 flex-wrap">
                            {periodOptions.map((p) => (
                                <button
                                    key={p.value}
                                    type="button"
                                    onClick={() => setPeriod(p.value)}
                                    className={
                                        "flex-1 min-w-[80px] py-2.5 px-3 rounded-xl font-semibold text-[13px] " +
                                        "transition-colors " +
                                        (period === p.value
                                            ? "bg-[var(--brand)] text-white shadow-[0_4px_12px_-4px_var(--brand)]"
                                            : "bg-(--card) border border-(--line) text-(--ink) hover:bg-(--app)")
                                    }
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </Field>

                    <Field label={`${periodLabel} limit`}>
                        <AmountInput
                            value={limitAmount}
                            onChange={setLimitAmount}
                            placeholder="0"
                            autoFocus
                        />
                    </Field>

                    {error && (
                        <div className="text-[12px] font-semibold text-(--out) text-center">
                            {error}
                        </div>
                    )}
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
                        {saving ? "Saving…" : isEdit ? "Save changes" : "Save budget"}
                    </Button>
                </ButtonRow>
            </div>
        </PhoneFrame>
    );
}

export default function AddBudget({ mode = "new" }) {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = mode === "edit";

    const { categories, loading: cLoad } = useCategories("expense");
    const { budget, loading: bLoad } = useBudget(isEdit ? id : null);

    if (cLoad || (isEdit && bLoad)) return <BootScreen />;

    if (isEdit && !budget) {
        return (
            <PhoneFrame>
                <StatusBar />
                <ScrollArea>
                    <AppBar title="Edit budget" showBack={false} onBack={() => navigate("/budgets")} />
                    <div className="text-center py-10 px-4">
                        <b className="block text-[13.5px] font-semibold mb-2">Not found</b>
                        <small className="block text-[12px] text-(--muted) mb-4">
                            This budget may have been deleted.
                        </small>
                        <Button onClick={() => navigate("/budgets")}>
                            Back to budgets
                        </Button>
                    </div>
                </ScrollArea>
            </PhoneFrame>
        );
    }

    return <BudgetForm id={id} isEdit={isEdit} initial={budget} categories={categories} />;
}