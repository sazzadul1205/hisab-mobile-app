import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import {
    listBudgets,
    calculateBudgetActuals,
    calculateBudgetSummary,
    monthKeyFromDate,
    previousMonthKey,
    nextMonthKey,
    formatMonthKey,
} from "../services/budgets";
import { decryptRecord, EncryptionNotReadyError } from "../services/encryption";

async function safeDecryptAll(tableName, rows) {
    try {
        return await Promise.all(rows.map((r) => decryptRecord(tableName, r)));
    } catch (err) {
        if (err instanceof EncryptionNotReadyError) return undefined;
        throw err;
    }
}

export function useBudgets(monthKey) {
    const resolvedMonthKey = monthKey ?? monthKeyFromDate();
    const budgets = useLiveQuery(async () => {
        const rows = await listBudgets(resolvedMonthKey);
        return rows;
    }, [resolvedMonthKey]);

    const transactions = useLiveQuery(async () => {
        const rows = await db.transactions.toArray();
        return safeDecryptAll("transactions", rows);
    }, []);

    const categories = useLiveQuery(async () => {
        const rows = await db.categories.where("type").equals("expense").toArray();
        return safeDecryptAll("categories", rows);
    }, []);

    const summaries = useMemo(() => {
        if (!budgets || !transactions) return [];
        const actuals = calculateBudgetActuals(transactions, resolvedMonthKey);
        return budgets.map((b) => {
            const cat = categories?.find((c) => c.id === b.categoryId);
            return {
                ...calculateBudgetSummary(b, actuals.get(b.categoryId)),
                categoryName: cat?.name ?? "Unknown",
            };
        });
    }, [budgets, transactions, categories, resolvedMonthKey]);

    const totals = useMemo(() => {
        if (!summaries.length) return { totalLimit: 0, totalSpent: 0, totalRemaining: 0 };
        return summaries.reduce(
            (acc, s) => ({
                totalLimit: acc.totalLimit + s.limitAmount,
                totalSpent: acc.totalSpent + s.spent,
                totalRemaining: acc.totalRemaining + s.remaining,
            }),
            { totalLimit: 0, totalSpent: 0, totalRemaining: 0 }
        );
    }, [summaries]);

    return {
        budgets,
        summaries,
        totals,
        loading: budgets === undefined || transactions === undefined,
        monthKey: resolvedMonthKey,
        previousMonthKey: previousMonthKey(resolvedMonthKey),
        nextMonthKey: nextMonthKey(resolvedMonthKey),
        formatMonthKey,
    };
}

export function useBudget(id) {
    const budget = useLiveQuery(async () => {
        if (!id) return null;
        const row = await db.budgets.get(id);
        if (!row) return null;
        try {
            return await decryptRecord("budgets", row);
        } catch (err) {
            if (err instanceof EncryptionNotReadyError) return undefined;
            throw err;
        }
    }, [id]);
    return {
        budget: budget ?? null,
        loading: budget === undefined,
    };
}