/* ----------------------------------------------------------------
   Budget service — monthly category budgets.
   All amounts in minor units (paisa).
   ---------------------------------------------------------------- */

import { db } from "../db/db";
import { encryptRecord, decryptRecord } from "./encryption";

const TABLE = "budgets";

export function monthKeyFromDate(date = new Date()) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function parseMonthKey(key) {
    const [year, month] = key.split("-").map(Number);
    return { year, month };
}

export function formatMonthKey(key) {
    const { year, month } = parseMonthKey(key);
    const date = new Date(year, month - 1, 1);
    return date.toLocaleString("en-US", { month: "long", year: "numeric" });
}

export function previousMonthKey(key) {
    const { year, month } = parseMonthKey(key);
    const date = new Date(year, month - 2, 1);
    return monthKeyFromDate(date);
}

export function nextMonthKey(key) {
    const { year, month } = parseMonthKey(key);
    const date = new Date(year, month, 1);
    return monthKeyFromDate(date);
}

export async function createBudget({ categoryId, monthKey, limitAmount }) {
    if (!categoryId) throw new Error("CATEGORY_REQUIRED");
    if (!monthKey) throw new Error("MONTH_REQUIRED");
    if (!Number.isInteger(limitAmount) || limitAmount <= 0) {
        throw new Error("LIMIT_INVALID");
    }

    const existing = await db.budgets
        .where("[categoryId+monthKey]")
        .equals([categoryId, monthKey])
        .first();
    if (existing) throw new Error("BUDGET_EXISTS");

    const now = new Date().toISOString();
    const budget = {
        id: crypto.randomUUID(),
        categoryId,
        monthKey,
        limitAmount,
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

    if (patch.categoryId || patch.monthKey) {
        const categoryId = patch.categoryId ?? existing.categoryId;
        const monthKey = patch.monthKey ?? existing.monthKey;
        const duplicate = await db.budgets
            .where("[categoryId+monthKey]")
            .equals([categoryId, monthKey])
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

export async function getBudgetByCategoryMonth(categoryId, monthKey) {
    const row = await db.budgets
        .where("[categoryId+monthKey]")
        .equals([categoryId, monthKey])
        .first();
    if (!row) return null;
    return decryptRecord(TABLE, row);
}

export async function listBudgets(monthKey) {
    let query = db.budgets.orderBy("createdAt");
    if (monthKey) {
        query = db.budgets.where("monthKey").equals(monthKey);
    }
    const rows = await query.toArray();
    return Promise.all(rows.map((r) => decryptRecord(TABLE, r)));
}

export function calculateBudgetActuals(transactions, monthKey) {
    const { year, month } = parseMonthKey(monthKey);
    const from = new Date(year, month - 1, 1).toISOString();
    const to = new Date(year, month, 0, 23, 59, 59, 999).toISOString();

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
        budgetId: budget.id,
        categoryId: budget.categoryId,
        limitAmount: budget.limitAmount,
        spent,
        remaining,
        usagePercent,
        status,
    };
}