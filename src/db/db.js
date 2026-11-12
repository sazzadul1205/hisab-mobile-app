/* ----------------------------------------------------------------
   Dexie schema for Hisab.

   v1: initial schema (accounts, transactions, categories, reconciliationRecords, importRecords, appSettings)
   v2: adds budgets table for monthly category budgets
   v3: adds period support to budgets (daily, weekly, monthly, custom)
   v4: adds [period+periodKey] index for efficient period queries
   ---------------------------------------------------------------- */

import Dexie from "dexie";
import { DEFAULT_CATEGORIES } from "../constants/categories";

export const db = new Dexie("HisabDB");

db.version(1).stores({
    // id, name, type, openingBalance (paisa), createdAt, isArchived
    accounts: "id, name, type, isArchived, createdAt",

    // id, type, amount, fee, accountId, destinationAccountId, categoryId, date, note, createdAt, updatedAt
    transactions:
        "id, type, accountId, destinationAccountId, categoryId, date, createdAt, [accountId+date], [type+date]",

    // id, name, type, isDefault
    categories: "id, name, type, isDefault",

    // id, accountId, reconciliationDate, recordedBalance, actualBalance, difference
    reconciliationRecords: "id, accountId, reconciliationDate",

    // id, accountId, fileName, importDate, status, importedCount, skippedCount
    importRecords: "id, accountId, importDate, status",

    // key-value for autoLockDuration, biometricUnlockEnabled, etc.
    // (auth secrets live separately — never mixed with app settings)
    appSettings: "key",
});

db.version(2).stores({
    // id, categoryId, monthKey (YYYY-MM), limitAmount, createdAt, updatedAt
    budgets: "id, categoryId, monthKey, createdAt, [categoryId+monthKey]",
}).upgrade(async (tx) => {
    // Budgets table is new in v2, no data to migrate
    await tx.budgets.clear();
});

db.version(4).stores({
    // id, categoryId, period (daily|weekly|monthly|custom), periodKey (YYYY-MM-DD|YYYY-WW|YYYY-MM), limitAmount, createdAt, updatedAt
    budgets: "id, categoryId, period, periodKey, createdAt, [categoryId+period+periodKey], [period+periodKey]",
}).upgrade(async (tx) => {
    // Migrate existing monthly budgets to new schema
    const oldBudgets = await tx.budgets.toArray();
    for (const b of oldBudgets) {
        await tx.budgets.put({
            ...b,
            period: "monthly",
            periodKey: b.monthKey, // YYYY-MM format
        });
    }
});

/**
 * Seed default categories on first launch. Safe to call repeatedly —
 * no-ops when categories already exist.
 */
export async function seedDefaultCategories() {
    const count = await db.categories.count();
    if (count > 0) return;
    await db.categories.bulkAdd(DEFAULT_CATEGORIES);
}