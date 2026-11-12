import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { PullToRefresh } from "../../components/PullToRefresh";
import { IconButton } from "../../components/IconButton";
import { BottomNav } from "../../components/BottomNav";
import { AmountInput } from "../../components/AmountInput";
import { CategoryPicker } from "../../components/CategoryPicker";
import { useBudgets } from "../../hooks/useBudgets";
import { useCategories } from "../../hooks/useTransactions";
import { createBudget, updateBudget, deleteBudget } from "../../services/budgets";
import { formatBDTShort } from "../../lib/money";

const STATUS_STYLES = {
    under: "text-(--in)",
    near: "text-(--warn)",
    over: "text-(--out)",
};

const STATUS_LABELS = {
    under: "Under",
    near: "Near limit",
    over: "Over",
};

function BudgetRow({ budget, onEdit, onDelete }) {
    const statusStyle = STATUS_STYLES[budget.status];
    const statusLabel = STATUS_LABELS[budget.status];

    const progressWidth = Math.min(100, Math.max(0, budget.usagePercent));

    return (
        <div className="bg-(--card) border border-(--line) rounded-[14px] p-3.5 mb-2">
            <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[13px] font-semibold text-(--ink)">
                        {budget.categoryName}
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusStyle} bg-opacity-10`}>
                            {statusLabel}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-[12px] text-(--ink-2)">
                        <span className="font-bold num {statusStyle}">{formatBDTShort(budget.spent)}</span>
                        <span className="text-(--muted)">/</span>
                        <span className="font-bold num">{formatBDTShort(budget.limitAmount)}</span>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={onEdit}
                        className="p-1.5 rounded-lg text-(--muted) hover:text-(--ink) hover:bg-(--app) transition-colors"
                        aria-label="Edit budget"
                    >
                        <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none stroke-2 [stroke-linecap:round] [stroke-linejoin:round]">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-1.5 rounded-lg text-(--muted) hover:text-(--out) hover:bg-(--app) transition-colors"
                        aria-label="Delete budget"
                    >
                        <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none stroke-2 [stroke-linecap:round] [stroke-linejoin:round]">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="h-2 rounded-full bg-(--line-2) overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                        width: `${progressWidth}%`,
                        background: `var(--${budget.status === "over" ? "out" : budget.status === "near" ? "warn" : "in"})`,
                    }}
                />
            </div>

            <div className="flex items-center justify-between mt-2 text-[11px]">
                <span className="text-(--muted)">Remaining</span>
                <span className={`font-bold num ${statusStyle}`}>
                    {budget.remaining >= 0
                        ? formatBDTShort(budget.remaining)
                        : `−${formatBDTShort(Math.abs(budget.remaining))}`}
                </span>
            </div>
        </div>
    );
}

function EmptyState({ onAdd }) {
    return (
        <div className="text-center py-10 px-4">
            <div className="w-16 h-16 rounded-[22px] mx-auto mb-4 grid place-items-center bg-(--brand-soft) text-(--brand-dk)">
                <svg
                    viewBox="0 0 24 24"
                    className="w-7 h-7 stroke-current fill-none stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]"
                >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M9 9h6M9 15h6" />
                </svg>
            </div>
            <b className="block text-[15px] font-bold mb-2">No budgets yet</b>
            <small className="block text-[12.5px] text-(--muted) leading-[1.6] max-w-[34ch] mx-auto mb-5">
                Set a monthly spending limit for a category to track your expenses.
            </small>
            <button
                onClick={onAdd}
                className="w-full p-3.75 rounded-[14px] font-bold text-[14.5px]
                           tracking-[-0.1px] border-0 cursor-pointer
                           bg-(--brand) text-white
                           shadow-[0_10px_20px_-12px_rgba(14,124,90,0.9)]"
            >
                + Add budget
            </button>
        </div>
    );
}

function BudgetForm({ budget, categories, onSubmit, onCancel }) {
    const [categoryId, setCategoryId] = useState(budget?.categoryId ?? "");
    const [limitAmount, setLimitAmount] = useState(
        budget ? String(budget.limitAmount) : ""
    );
    const [error, setError] = useState("");

    const expenseCategories = categories.filter((c) => c.type === "expense");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!categoryId) {
            setError("Please select a category");
            return;
        }
        const amount = parseInt(limitAmount, 10);
        if (!Number.isInteger(amount) || amount <= 0) {
            setError("Please enter a valid amount");
            return;
        }

        try {
            await onSubmit({ categoryId, limitAmount: amount });
        } catch (err) {
            if (err.message === "BUDGET_EXISTS") {
                setError("A budget for this category and month already exists");
            } else if (err.message === "LIMIT_INVALID") {
                setError("Amount must be a positive number");
            } else {
                setError("Failed to save budget");
            }
        }
    };

    const isEdit = !!budget;

    return (
        <div className="bg-(--card) border border-(--line) rounded-[18px] p-4 space-y-4">
            <h3 className="m-0 text-[16px] font-bold">
                {isEdit ? "Edit budget" : "Add budget"}
            </h3>

            <form onSubmit={handleSubmit}>
                <div>
                    <label className="block text-[12px] font-semibold text-(--ink-2) mb-1.5">
                        Category
                    </label>
                    <CategoryPicker
                        categories={expenseCategories}
                        value={categoryId}
                        onChange={setCategoryId}
                        placeholder="Select expense category"
                    />
                </div>

                <div>
                    <label className="block text-[12px] font-semibold text-(--ink-2) mb-1.5">
                        Monthly limit
                    </label>
                    <AmountInput
                        value={limitAmount}
                        onChange={setLimitAmount}
                        placeholder="0"
                        autoFocus
                    />
                </div>

                {error && (
                    <div className="text-[12px] text-(--out) bg-(--danger-soft) p-2.5 rounded-[10px]">
                        {error}
                    </div>
                )}

                <div className="flex gap-2 pt-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 p-3 rounded-xl font-semibold text-[14px] border border-(--line) bg-(--card) text-(--ink) cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex-1 p-3 rounded-xl font-semibold text-[14px] border-0 bg-(--brand) text-white cursor-pointer"
                    >
                        {isEdit ? "Save" : "Add budget"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function Budgets() {
    const navigate = useNavigate();
    const { categories, loading: catsLoading } = useCategories("expense");
    const {
        summaries,
        totals,
        loading,
        monthKey,
        previousMonthKey,
        nextMonthKey,
        formatMonthKey,
    } = useBudgets();

    const [showForm, setShowForm] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);

    const handleAdd = async (data) => {
        await createBudget({ ...data, monthKey });
        setShowForm(false);
    };

    const handleEdit = async (data) => {
        await updateBudget(editingBudget.id, data);
        setEditingBudget(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this budget?")) {
            await deleteBudget(id);
        }
    };

    if (loading || catsLoading) {
        return (
            <PhoneFrame>
                <StatusBar />
                <ScrollArea>
                    <div className="p-4 space-y-3">
                        <div className="skeleton-box h-7 w-32 rounded" />
                        <div className="skeleton-box h-20 rounded-[14px]" />
                        <div className="skeleton-box h-20 rounded-[14px]" />
                        <div className="skeleton-box h-20 rounded-[14px]" />
                    </div>
                </ScrollArea>
                <BottomNav active="budgets" />
            </PhoneFrame>
        );
    }

    return (
        <PhoneFrame>
            <StatusBar />
            <PullToRefresh
                onRefresh={async () => {
                    await new Promise((res) => setTimeout(res, 800));
                }}
            >
                <div className="flex items-center justify-between gap-3 py-1.5 pb-3.5">
                    <div>
                        <h2 className="m-0 text-[23px] font-bold tracking-[-0.5px] leading-tight">
                            Budgets
                        </h2>
                        <div className="text-[12.5px] text-(--muted) mt-0.75">
                            {formatMonthKey(monthKey)}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <IconButton
                            label="Previous month"
                            icon={<path d="M15 18l-6-6 6-6" />}
                            onClick={() => navigate(`/budgets?month=${previousMonthKey}`)}
                        />
                        <IconButton
                            label="Next month"
                            icon={<path d="M9 6l6 6-6 6" />}
                            onClick={() => navigate(`/budgets?month=${nextMonthKey}`)}
                        />
                        <IconButton
                            label="Add budget"
                            icon={<path d="M12 5v14M5 12h14" />}
                            onClick={() => setShowForm(true)}
                        />
                    </div>
                </div>

                <div className="stagger">
                    {totals.totalLimit > 0 && (
                        <div className="bg-(--card) border border-(--line) rounded-[18px] p-4 mb-3">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="m-0 text-[14px] font-bold">Total</h3>
                                <span className="text-[12px] text-(--muted)">{formatMonthKey(monthKey)}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div>
                                    <div className="text-[11px] text-(--muted)">Budgeted</div>
                                    <div className="text-[18px] font-bold num text-(--ink)">{formatBDTShort(totals.totalLimit)}</div>
                                </div>
                                <div>
                                    <div className="text-[11px] text-(--muted)">Spent</div>
                                    <div className="text-[18px] font-bold num text-(--out)">{formatBDTShort(totals.totalSpent)}</div>
                                </div>
                                <div>
                                    <div className="text-[11px] text-(--muted)">Remaining</div>
                                    <div className={`text-[18px] font-bold num ${totals.totalRemaining >= 0 ? "text-(--in)" : "text-(--out)"}`}>
                                        {totals.totalRemaining >= 0
                                            ? formatBDTShort(totals.totalRemaining)
                                            : `−${formatBDTShort(Math.abs(totals.totalRemaining))}`}
                                    </div>
                                </div>
                            </div>
                            <div className="h-2 rounded-full bg-(--line-2) overflow-hidden mt-3">
                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${totals.totalLimit > 0 ? Math.min(100, Math.round((totals.totalSpent / totals.totalLimit) * 100)) : 0}%`,
                                        background: "var(--brand)",
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {summaries.length === 0 ? (
                        <EmptyState onAdd={() => setShowForm(true)} />
                    ) : (
                        <div>
                            {summaries.map((b) => (
                                <BudgetRow
                                    key={b.budgetId}
                                    budget={b}
                                    onEdit={() => setEditingBudget(b)}
                                    onDelete={() => handleDelete(b.budgetId)}
                                />
                            ))}
                        </div>
                    )}

                    {showForm && (
                        <BudgetForm
                            categories={categories}
                            onSubmit={handleAdd}
                            onCancel={() => setShowForm(false)}
                            monthKey={monthKey}
                        />
                    )}

                    {editingBudget && (
                        <BudgetForm
                            budget={editingBudget}
                            categories={categories}
                            onSubmit={handleEdit}
                            onCancel={() => setEditingBudget(null)}
                            monthKey={monthKey}
                        />
                    )}
                </div>
            </PullToRefresh>
            <BottomNav active="budgets" />
        </PhoneFrame>
    );
}