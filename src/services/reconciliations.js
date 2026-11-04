import { db } from "../db/db";
import { encryptRecord, decryptRecord } from "./encryption";

const TABLE = "reconciliationRecords";

export async function saveReconciliation({
    accountId,
    recordedBalance,
    actualBalance,
    note = "",
}) {
    if (!accountId) throw new Error("ACCOUNT_REQUIRED");
    if (!Number.isInteger(recordedBalance) || !Number.isInteger(actualBalance)) {
        throw new Error("BALANCE_INVALID");
    }

    const record = {
        id: crypto.randomUUID(),
        accountId,
        reconciliationDate: new Date().toISOString(),
        recordedBalance,
        actualBalance,
        difference: actualBalance - recordedBalance,
        note: note.trim(),
    };
    await db.reconciliationRecords.add(await encryptRecord(TABLE, record));
    return record;
}

export async function listReconciliations(accountId) {
    const rows = await db.reconciliationRecords
        .where("accountId")
        .equals(accountId)
        .reverse()
        .sortBy("reconciliationDate");
    return Promise.all(rows.map((r) => decryptRecord(TABLE, r)));
}