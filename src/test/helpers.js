import { db } from "../db/db";
import { setupVault } from "../crypto/vault";
import { setActiveKey, lock } from "../auth/session";

const FAST = { iterations: 10_000 };

export async function clearAllTables() {
    await Promise.all([
        db.accounts.clear(),
        db.transactions.clear(),
        db.categories.clear(),
        db.reconciliationRecords.clear(),
        db.importRecords.clear(),
        db.appSettings.clear(),
    ]);
}

export async function withFreshDek() {
    lock();
    const { dekBytes } = await setupVault("123456", FAST);
    setActiveKey(dekBytes);
    return dekBytes;
}

/** Call in beforeEach. Fresh DEK + empty tables. */
export async function resetTestState() {
    await clearAllTables();
    return withFreshDek();
}

export const hex = (bytes) =>
    Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");