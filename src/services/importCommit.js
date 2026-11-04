/* ----------------------------------------------------------------
   Bulk import — write reviewed rows to db.transactions.

   Skips balance checks intentionally: this is recorded history,
   not a new transaction. Overdrafts in imported data are allowed.

   Atomic: all rows added or none.
   ---------------------------------------------------------------- */

import { db } from "../db/db";
import { encryptRecord } from "./encryption";

export async function commitImport({ rows, accountId }) {
    if (!Array.isArray(rows) || rows.length === 0) {
        throw new Error("NO_ROWS");
    }
    if (!accountId) throw new Error("ACCOUNT_REQUIRED");

    const now = new Date().toISOString();
    const txs = rows.map((r) => ({
        id: crypto.randomUUID(),
        type: r.direction === "in" ? "income" : "expense",
        amount: r.amount,
        accountId,
        categoryId: r.categoryId,
        date: r.date,
        note: r.description,
        createdAt: now,
        updatedAt: now,
    }));

    // Encrypt outside the transaction — crypto yields, which would
    // auto-commit a Dexie zone early.
    const encrypted = await Promise.all(
        txs.map((t) => encryptRecord("transactions", t)),
    );

    await db.transaction("rw", db.transactions, async () => {
        await db.transactions.bulkAdd(encrypted);
    });

    return txs.length;
}