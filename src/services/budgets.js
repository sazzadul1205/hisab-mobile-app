/* ----------------------------------------------------------------
   Budget service — flexible period budgets (daily, weekly, monthly, custom).
   All amounts in minor units (paisa).
   ---------------------------------------------------------------- */

import { db } from "../db/db";
import { encryptRecord, decryptRecord } from "./encryption";

const TABLE = "budgets";

export const BUDGET_TYPES = {
    recurring: "recurring",
    onetime: "onetime",
};

export const BUDGET_PERIODS = {
    daily: "daily",
    weekly: "weekly",
    monthly: "monthly",
    custom: "custom",
};

export const PERIOD_LABELS = {
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    custom: "Custom",
};

export const BUDGET_TYPE_LABELS = {
    recurring: "Recurring",
    onetime: "One-time",
};

/** Get period key for a date based on period type */
export function getPeriodKey(date, period) {
    const d = new Date(date);
    switch (period) {
        case BUDGET_PERIODS.daily:
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        case BUDGET_PERIODS.weekly: {
            const { year, week } = getISOWeek(d);
            return `${year}-W${String(week).padStart(2, "0")}`;
        }
        case BUDGET_PERIODS.monthly:
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        case BUDGET_PERIODS.custom:
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        default:
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    }
}

/** Get ISO week year and week number */
function getISOWeek(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return { year: d.getUTCFullYear(), week };
}

/** Get the start of the ISO week (Monday) for a given ISO year and week */
function getISOWeekStart(isoYear, isoWeek) {
    if (!isoYear || !isoWeek || isoWeek < 1 || isoWeek > 53) {
        const now = new Date();
        const { year, week } = getISOWeek(now);
        return getISOWeekStart(year, week);
    }
    const jan4 = new Date(Date.UTC(isoYear, 0, 4));
    const dayOfWeek = jan4.getUTCDay() || 7;
    const weekStart = new Date(jan4);
    weekStart.setUTCDate(jan4.getUTCDate() - dayOfWeek + 1 + (isoWeek - 1) * 7);
    if (isNaN(weekStart.getTime())) {
        const now = new Date();
        const { year, week } = getISOWeek(now);
        return getISOWeekStart(year, week);
    }
    return weekStart;
}

/** Parse period key back to components */
export function parsePeriodKey(periodKey, period) {
    switch (period) {
        case BUDGET_PERIODS.daily: {
            const [year, month, day] = periodKey.split("-").map(Number);
            return { year, month, day };
        }
        case BUDGET_PERIODS.weekly: {
            const [year, week] = periodKey.split("-W").map(Number);
            return { year, week: Number(week) };
        }
        case BUDGET_PERIODS.monthly: {
            const [year, month] = periodKey.split("-").map(Number);
            return { year, month };
        }
        case BUDGET_PERIODS.custom: {
            const [year, month, day] = periodKey.split("-").map(Number);
            return { year, month, day };
        }
        default:
            return { year: new Date().getFullYear(), month: new Date().getMonth() + 1 };
    }
}

/** Format period key for display */
export function formatPeriodKey(periodKey, period) {
    switch (period) {
        case BUDGET_PERIODS.daily: {
            const { year, month, day } = parsePeriodKey(periodKey, period);
            return new Date(year, month - 1, day).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
        }
        case BUDGET_PERIODS.weekly: {
            const { year, week } = parsePeriodKey(periodKey, period);
            const weekStart = getISOWeekStart(year, week);
            const weekEnd = new Date(weekStart);
            weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
            return `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
        }
        case BUDGET_PERIODS.monthly: {
            const { year, month } = parsePeriodKey(periodKey, period);
            return new Date(year, month - 1, 1).toLocaleString("en-US", { month: "long", year: "numeric" });
        }
        case BUDGET_PERIODS.custom: {
            const { year, month, day } = parsePeriodKey(periodKey, period);
            return new Date(year, month - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        }
        default:
            return periodKey;
    }
}

/** Get date range for a period key */
export function getPeriodDateRange(periodKey, period) {
    if (!periodKey || !period) {
        const now = new Date();
        const defaultPeriodKey = getPeriodKey(now, BUDGET_PERIODS.monthly);
        return getPeriodDateRange(defaultPeriodKey, BUDGET_PERIODS.monthly);
    }
    switch (period) {
        case BUDGET_PERIODS.daily: {
            const { year, month, day } = parsePeriodKey(periodKey, period);
            if (!year || !month || !day) break;
            const from = new Date(year, month - 1, day, 0, 0, 0, 0).toISOString();
            const to = new Date(year, month - 1, day, 23, 59, 59, 999).toISOString();
            return { from, to };
        }
        case BUDGET_PERIODS.weekly: {
            const { year, week } = parsePeriodKey(periodKey, period);
            if (!year || !week) break;
            const weekStart = getISOWeekStart(year, week);
            const weekEnd = new Date(weekStart);
            weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
            weekEnd.setUTCHours(23, 59, 59, 999);
            return { from: weekStart.toISOString(), to: weekEnd.toISOString() };
        }
        case BUDGET_PERIODS.monthly: {
            const { year, month } = parsePeriodKey(periodKey, period);
            if (!year || !month) break;
            const from = new Date(year, month - 1, 1, 0, 0, 0, 0).toISOString();
            const to = new Date(year, month, 0, 23, 59, 59, 999).toISOString();
            return { from, to };
        }
        case BUDGET_PERIODS.custom: {
            const { year, month, day } = parsePeriodKey(periodKey, period);
            if (!year || !month || !day) break;
            const from = new Date(year, month - 1, day, 0, 0, 0, 0).toISOString();
            const to = new Date(year, month - 1, day, 23, 59, 59, 999).toISOString();
            return { from, to };
        }
    }
    const now = new Date();
    return { from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(), to: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString() };
}

/** Get previous period key */
export function getPreviousPeriodKey(periodKey, period) {
    switch (period) {
        case BUDGET_PERIODS.daily: {
            const { year, month, day } = parsePeriodKey(periodKey, period);
            const prev = new Date(year, month - 1, day - 1);
            return getPeriodKey(prev, period);
        }
        case BUDGET_PERIODS.weekly: {
            const { year, week } = parsePeriodKey(periodKey, period);
            const prevWeek = week - 1;
            if (prevWeek <= 0) {
                const prevYear = year - 1;
                const { week: weeksInPrevYear } = getISOWeek(new Date(prevYear, 11, 31));
                return `${prevYear}-W${String(weeksInPrevYear).padStart(2, "0")}`;
            }
            return `${year}-W${String(prevWeek).padStart(2, "0")}`;
        }
        case BUDGET_PERIODS.monthly: {
            const { year, month } = parsePeriodKey(periodKey, period);
            const prev = new Date(year, month - 2, 1);
            return getPeriodKey(prev, period);
        }
        case BUDGET_PERIODS.custom: {
            const { year, month, day } = parsePeriodKey(periodKey, period);
            const prev = new Date(year, month - 1, day - 1);
            return getPeriodKey(prev, period);
        }
        default:
            return periodKey;
    }
}

/** Get next period key */
export function getNextPeriodKey(periodKey, period) {
    switch (period) {
        case BUDGET_PERIODS.daily: {
            const { year, month, day } = parsePeriodKey(periodKey, period);
            const next = new Date(year, month - 1, day + 1);
            return getPeriodKey(next, period);
        }
        case BUDGET_PERIODS.weekly: {
            const { year, week } = parsePeriodKey(periodKey, period);
            const { week: weeksInYear } = getISOWeek(new Date(year, 11, 31));
            const nextWeek = week + 1;
            if (nextWeek > weeksInYear) {
                return `${year + 1}-W01`;
            }
            return `${year}-W${String(nextWeek).padStart(2, "0")}`;
        }
        case BUDGET_PERIODS.monthly: {
            const { year, month } = parsePeriodKey(periodKey, period);
            const next = new Date(year, month, 1);
            return getPeriodKey(next, period);
        }
        case BUDGET_PERIODS.custom: {
            const { year, month, day } = parsePeriodKey(periodKey, period);
            const next = new Date(year, month - 1, day + 1);
            return getPeriodKey(next, period);
        }
        default:
            return periodKey;
    }
}

export async function createBudget({ categoryId, period, periodKey, limitAmount, budgetType }) {
    if (!categoryId) throw new Error("CATEGORY_REQUIRED");
    if (!period) throw new Error("PERIOD_REQUIRED");
    if (!periodKey) throw new Error("PERIOD_KEY_REQUIRED");
    if (!budgetType) throw new Error("BUDGET_TYPE_REQUIRED");
    if (!Number.isInteger(limitAmount) || limitAmount <= 0) {
        throw new Error("LIMIT_INVALID");
    }

    const existing = await db.budgets
        .where("[categoryId+period+periodKey]")
        .equals([categoryId, period, periodKey])
        .first();
    if (existing) throw new Error("BUDGET_EXISTS");

    const now = new Date().toISOString();
    const budget = {
        id: crypto.randomUUID(),
        categoryId,
        period,
        periodKey,
        limitAmount,
        budgetType,
        createdAt: now,
        updatedAt: now,
    };
    await db.budgets.add(await encryptRecord(TABLE, budget));
    return budget;
}

export async function updateBudget(id, patch) {
    const row = await db.budgets.get(id);
    if (!row) throw new Error("NOT_FOUND");
    const existing = await decryptRecord(TABLE, row);

    const merged = {
        ...existing,
        ...patch,
        updatedAt: new Date().toISOString(),
    };

    if (patch.limitAmount != null) {
        if (!Number.isInteger(patch.limitAmount) || patch.limitAmount <= 0) {
            throw new Error("LIMIT_INVALID");
        }
    }

    if (patch.categoryId || patch.period || patch.periodKey) {
        const categoryId = patch.categoryId ?? existing.categoryId;
        const period = patch.period ?? existing.period;
        const periodKey = patch.periodKey ?? existing.periodKey;
        const duplicate = await db.budgets
            .where("[categoryId+period+periodKey]")
            .equals([categoryId, period, periodKey])
            .first();
        if (duplicate && duplicate.id !== id) {
            throw new Error("BUDGET_EXISTS");
        }
    }

    await db.budgets.put(await encryptRecord(TABLE, merged));
    return merged;
}

export async function deleteBudget(id) {
    await db.budgets.delete(id);
}

export async function getBudget(id) {
    const row = await db.budgets.get(id);
    if (!row) return null;
    return decryptRecord(TABLE, row);
}

export async function getBudgetByCategoryPeriod(categoryId, period, periodKey) {
    const row = await db.budgets
        .where("[categoryId+period+periodKey]")
        .equals([categoryId, period, periodKey])
        .first();
    if (!row) return null;
    return decryptRecord(TABLE, row);
}

export async function listBudgets(period, periodKey) {
    let query = db.budgets.orderBy("createdAt");
    if (period && periodKey) {
        query = db.budgets.where("[period+periodKey]").equals([period, periodKey]);
    } else if (period) {
        query = db.budgets.where("period").equals(period);
    }
    const rows = await query.toArray();
    return Promise.all(rows.map((r) => decryptRecord(TABLE, r)));
}

export function calculateBudgetActuals(transactions, periodKey, period) {
    const { from, to } = getPeriodDateRange(periodKey, period);

    const actuals = new Map();
    for (const tx of transactions) {
        if (tx.type !== "expense") continue;
        if (tx.date < from || tx.date > to) continue;
        if (!tx.categoryId) continue;
        actuals.set(tx.categoryId, (actuals.get(tx.categoryId) ?? 0) + tx.amount);
    }
    return actuals;
}

export function calculateBudgetSummary(budget, actualAmount) {
    const spent = actualAmount ?? 0;
    const remaining = budget.limitAmount - spent;
    const usagePercent = budget.limitAmount > 0
        ? Math.round((spent / budget.limitAmount) * 100)
        : 0;

    let status = "under";
    if (usagePercent >= 100) status = "over";
    else if (usagePercent >= 80) status = "near";

    return {
        id: budget.id,
        budgetId: budget.id,
        categoryId: budget.categoryId,
        period: budget.period,
        periodKey: budget.periodKey,
        limitAmount: budget.limitAmount,
        spent,
        remaining,
        usagePercent,
        status,
    };
}