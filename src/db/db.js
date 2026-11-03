/* ----------------------------------------------------------------
   Dexie schema for Hisab.

   Not yet imported by any UI. Phase 3 wires pages to these tables.
   For Phase 1 this file just declares the shape so services and
   future import code know what to expect.

   All amounts are stored as integer minor units (paisa).
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

/**
 * Seed default categories on first launch. Safe to call repeatedly —
 * no-ops when categories already exist.
 */
export async function seedDefaultCategories() {
    const count = await db.categories.count();
    if (count > 0) return;
    await db.categories.bulkAdd(DEFAULT_CATEGORIES);
}