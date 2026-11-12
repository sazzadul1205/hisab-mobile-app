/* ----------------------------------------------------------------
   Record-level encryption at rest.

   Shape of every stored record:
     {
       id, type, date, accountId, destinationAccountId, categoryId,
       isArchived, isDefault,                     // index fields (plaintext)
       enc: { iv: b64, ct: b64 }                  // everything else
     }

   Services call encryptRecord() before every write, and
   decryptRecord() after every read. The rest of the app never sees
   the encrypted shape.

   The DEK is fetched from session on demand. If the vault is locked
   (no DEK), throw a specific error the hooks can catch.
   ---------------------------------------------------------------- */

import { db } from "../db/db";
import { getActiveKey } from "../auth/session";
import { encryptForStorage, decryptFromStorage } from "../crypto/vault";
import { toB64, fromB64 } from "../lib/base64";

export class EncryptionNotReadyError extends Error {
    constructor() {
        super("ENCRYPTION_NOT_READY");
        this.name = "EncryptionNotReadyError";
    }
}

function requireDek() {
    const dek = getActiveKey();
    if (!dek) throw new EncryptionNotReadyError();
    return dek;
}

/* ----------------------------------------------------------------
   Index fields per table — MUST stay in sync with db.js schema.

   These are what Dexie queries and sorts on. They must be present
   outside `enc` for the query to work. Every write duplicates them
   into `enc` too, so the plaintext record is fully recoverable.
   ---------------------------------------------------------------- */
const INDEX_FIELDS = {
    accounts: ["id", "type", "isArchived", "createdAt"],
    transactions: [
        "id",
        "type",
        "date",
        "accountId",
        "destinationAccountId",
        "categoryId",
    ],
    categories: ["id", "type", "isDefault"],
    reconciliationRecords: ["id", "accountId", "reconciliationDate"],
    importRecords: ["id", "accountId", "importDate", "status"],
    budgets: ["id", "categoryId", "monthKey", "createdAt"],
};

export function isEncrypted(row) {
    return Boolean(
        row &&
        typeof row === "object" &&
        row.enc &&
        typeof row.enc.iv === "string" &&
        typeof row.enc.ct === "string",
    );
}

export async function encryptRecord(tableName, record) {
    const fields = INDEX_FIELDS[tableName];
    if (!fields) throw new Error(`UNKNOWN_TABLE: ${tableName}`);

    const dek = requireDek();
    const { iv, ct } = await encryptForStorage(record, dek);

    const row = {};
    for (const key of fields) {
        if (record[key] !== undefined) row[key] = record[key];
    }
    row.id = record.id;
    row.enc = { iv: toB64(iv), ct: toB64(ct) };
    return row;
}

export async function decryptRecord(tableName, row) {
    if (!isEncrypted(row)) return row; // pre-migration plaintext — passthrough
    const dek = requireDek();
    const { iv, ct } = row.enc;
    return decryptFromStorage(
        { iv: fromB64(iv), ct: fromB64(ct) },
        dek,
    );
}

/* ----------------------------------------------------------------
   One-time migration. Runs on first unlock after the upgrade
   installs. Idempotent — skips any row already in encrypted form,
   so interrupting and re-running is safe.
   ---------------------------------------------------------------- */
export const MIGRATION_FLAG_KEY = "encryption-v1-complete";

export async function ensureEncryptedAtRest() {
    const flag = await db.appSettings.get(MIGRATION_FLAG_KEY);
    if (flag?.value === true) return { skipped: true };

    const tables = [
        ["accounts", db.accounts],
        ["transactions", db.transactions],
        ["categories", db.categories],
        ["reconciliationRecords", db.reconciliationRecords],
        ["importRecords", db.importRecords],
    ];

    let migrated = 0;
    for (const [name, table] of tables) {
        const rows = await table.toArray();
        for (const row of rows) {
            if (isEncrypted(row)) continue;
            const encrypted = await encryptRecord(name, row);
            await table.put(encrypted);
            migrated += 1;
        }
    }

    await db.appSettings.put({ key: MIGRATION_FLAG_KEY, value: true });
    return { skipped: false, migrated };
}