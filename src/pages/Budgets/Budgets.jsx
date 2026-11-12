import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { PullToRefresh } from "../../components/PullToRefresh";
import { IconButton } from "../../components/IconButton";
import { BottomNav } from "../../components/BottomNav";
import { Chip, ChipStrip } from "../../components/Chip";
import { Button } from "../../components/Button";
import { BudgetCalendar } from "../../components/BudgetCalendar";
import { useBudgets } from "../../hooks/useBudgets";
import { useCategories } from "../../hooks/useTransactions";
import {
    deleteBudget,
    BUDGET_PERIODS,
    PERIOD_LABELS,
} from "../../services/budgets";
import { getBudgetingEnabled } from "../../services/settings";
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

function DeleteModal({ onCancel, onConfirm, busy, error }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-94.5 bg-(--card) rounded-[20px] p-5 shadow-2xl">
                <div className="w-12 h-12 rounded-[14px] mx-auto mb-4 grid place-items-center bg-(--danger-soft) text-(--danger)">
                    <svg
                        viewBox="0 0 24 24"
                        className="w-6 h-6 stroke-current fill-none stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]"
                    >
                        <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />
                    </svg>
                </div>
                <h3 className="m-0 mb-2 text-center text-[17px] font-bold tracking-[-0.3px]">
                    Delete this budget?
                </h3>
                <p className="m-0 mb-4 text-center text-[12.5px] text-(--muted) leading-[1.55]">
                    This will remove the budget for this category and period.
                </p>
                {error && (
                    <div className="text-[12px] font-semibold text-(--out) mb-3 text-center">
                        {error}
                    </div>
                )}
                <div className="flex gap-2.5">
                    <Button
                        variant="secondary"
                        className="flex-[0_0_40%]"
                        onClick={onCancel}
                        disabled={busy}
                    >
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={onConfirm} disabled={busy}>
                        {busy ? "Deleting…" : "Delete"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

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
                        <span
                            className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusStyle} bg-opacity-10`}
                        >
                            {statusLabel}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-[12px] text-(--ink-2)">
                        <span className="font-bold num">{formatBDTShort(budget.spent)}</span>
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
                        <svg
                            viewBox="0 0 24 24"
                            className="w-5 h-5 stroke-current fill-none stroke-2 [stroke-linecap:round] [stroke-linejoin:round]"
                        >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-1.5 rounded-lg text-(--muted) hover:text-(--out) hover:bg-(--app) transition-colors"
                        aria-label="Delete budget"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            className="w-5 h-5 stroke-current fill-none stroke-2 [stroke-linecap:round] [stroke-linejoin:round]"
                        >
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
                Set a spending limit for a category to track your expenses.
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

export default function Budgets() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const urlPeriod = searchParams.get("period") || BUDGET_PERIODS.monthly;
    const urlPeriodKey = searchParams.get("periodKey") || null;

    const [budgetingEnabled, setBudgetingEnabled] = useState(true);
    const { categories, loading: catsLoading } = useCategories("expense");
    const {
        summaries,
        totals,
        loading,
        period,
        periodKey,
        previousPeriodKey,
        nextPeriodKey,
        formatPeriodKey,
    } = useBudgets(urlPeriod, urlPeriodKey);

    useEffect(() => {
        getBudgetingEnabled().then(setBudgetingEnabled);
    }, []);

    const periodOptions = useMemo(() => [
        { value: BUDGET_PERIODS.daily, label: PERIOD_LABELS.daily },
        { value: BUDGET_PERIODS.weekly, label: PERIOD_LABELS.weekly },
        { value: BUDGET_PERIODS.monthly, label: PERIOD_LABELS.monthly },
    ], []);

    const handlePeriodChange = (newPeriod) => {
        const newPeriodKey = urlPeriodKey || new Date().toISOString().split("T")[0];
        const params = new URLSearchParams(searchParams);
        params.set("period", newPeriod);
        params.set("periodKey", newPeriodKey);
        navigate(`/budgets?${params.toString()}`);
    };

    const handlePeriodKeyChange = (newPeriodKey) => {
        const params = new URLSearchParams(searchParams);
        params.set("periodKey", newPeriodKey);
        navigate(`/budgets?${params.toString()}`);
    };

    const [deletingBudget, setDeletingBudget] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    const handleDelete = (id) => {
        setDeletingBudget(id);
        setDeleteError("");
        setConfirmDelete(true);
    };

    const confirmDeleteHandler = async () => {
        if (!deletingBudget) return;
        setDeleting(true);
        try {
            await deleteBudget(deletingBudget);
            setConfirmDelete(false);
            setDeletingBudget(null);
        } catch (err) {
            console.error(err);
            setDeleteError("Failed to delete budget");
        } finally {
            setDeleting(false);
        }
    };

    const cancelDeleteHandler = () => {
        if (deleting) return;
        setConfirmDelete(false);
        setDeletingBudget(null);
    };

    if (!budgetingEnabled) {
        return (
            <PhoneFrame>
                <StatusBar />
                <ScrollArea>
                    <div className="flex flex-col items-center justify-center py-20 px-4">
                        <div className="w-16 h-16 rounded-[22px] mx-auto mb-4 grid place-items-center bg-(--line) text-(--muted)">
                            <svg viewBox="0 0 24 24" className="w-8 h-8 stroke-current fill-none stroke-[1.5]">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <path d="M9 9h6M9 15h6" />
                            </svg>
                        </div>
                        <h3 className="text-[18px] font-bold mb-2 text-(--ink)">Budgeting Disabled</h3>
                        <p className="text-[13px] text-(--muted) text-center mb-6 max-w-[280px]">
                            Enable budgeting in Settings to start tracking your spending limits.
                        </p>
                        <button
                            onClick={() => navigate("/settings")}
                            className="px-6 py-3 rounded-xl font-semibold text-[14px]
                                       bg-[var(--brand)] text-white shadow-[0_4px_12px_-4px_var(--brand)]"
                        >
                            Go to Settings
                        </button>
                    </div>
                </ScrollArea>
                <BottomNav active="budgets" />
            </PhoneFrame>
        );
    }

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
                            {formatPeriodKey(periodKey)}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <IconButton
                            label="Previous period"
                            icon={<path d="M15 18l-6-6 6-6" />}
                            onClick={() => handlePeriodKeyChange(previousPeriodKey)}
                        />
                        <IconButton
                            label="Next period"
                            icon={<path d="M9 6l6 6-6 6" />}
                            onClick={() => handlePeriodKeyChange(nextPeriodKey)}
                        />
                        <IconButton
                            label="Add budget"
                            icon={<path d="M12 5v14M5 12h14" />}
                            onClick={() => navigate("/budgets/new")}
                        />
                    </div>
                </div>

                <div className="px-4 pb-2">
                    <ChipStrip>
                        {periodOptions.map((p) => (
                            <Chip
                                key={p.value}
                                on={period === p.value}
                                onClick={() => handlePeriodChange(p.value)}
                            >
                                {p.label}
                            </Chip>
                        ))}
                    </ChipStrip>
                </div>

                <BudgetCalendar
                    budgets={summaries}
                    period={period}
                    periodKey={periodKey}
                    onPeriodKeyChange={handlePeriodKeyChange}
                />

                <div className="stagger">
                    {totals.totalLimit > 0 && (
                        <div className="bg-(--card) border border-(--line) rounded-[18px] p-4 mb-3">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="m-0 text-[14px] font-bold">Total</h3>
                                <span className="text-[12px] text-(--muted)">
                                    {formatPeriodKey(periodKey)}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div>
                                    <div className="text-[11px] text-(--muted)">Budgeted</div>
                                    <div className="text-[18px] font-bold num text-(--ink)">
                                        {formatBDTShort(totals.totalLimit)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[11px] text-(--muted)">Spent</div>
                                    <div className="text-[18px] font-bold num text-(--out)">
                                        {formatBDTShort(totals.totalSpent)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[11px] text-(--muted)">Remaining</div>
                                    <div
                                        className={`text-[18px] font-bold num ${totals.totalRemaining >= 0 ? "text-(--in)" : "text-(--out)"}`}
                                    >
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
                        <EmptyState onAdd={() => navigate("/budgets/new")} />
                    ) : (
                        <div>
                            {summaries.map((b) => (
                                <BudgetRow
                                    key={b.budgetId}
                                    budget={b}
                                    onEdit={() => navigate(`/budgets/${b.budgetId}/edit`)}
                                    onDelete={() => handleDelete(b.budgetId)}
                                />
                            ))}
                        </div>
                    )}

                    {confirmDelete && (
                        <DeleteModal
                            busy={deleting}
                            error={deleteError}
                            onCancel={cancelDeleteHandler}
                            onConfirm={confirmDeleteHandler}
                        />
                    )}
                </div>
            </PullToRefresh>
            <BottomNav active="budgets" />
        </PhoneFrame>
    );
}