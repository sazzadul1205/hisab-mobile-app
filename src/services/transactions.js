import { db } from "../db/db";
import { accountBalance } from "./calc";
import { encryptRecord, decryptRecord } from "./encryption";

const TABLE = "transactions";

async function ensureSufficientBalance(accountId, totalDebit, excludeTxId) {
    const accountRow = await db.accounts.get(accountId);
    if (!accountRow) throw new Error("ACCOUNT_NOT_FOUND");
    const account = await decryptRecord("accounts", accountRow);

    const [srcRows, dstRows] = await Promise.all([
        db.transactions.where("accountId").equals(accountId).toArray(),
        db.transactions.where("destinationAccountId").equals(accountId).toArray(),
    ]);
    const allRows = [...srcRows, ...dstRows];
    const decrypted = await Promise.all(
        allRows.map((r) => decryptRecord(TABLE, r)),
    );
    const txs = excludeTxId
        ? decrypted.filter((t) => t.id !== excludeTxId)
        : decrypted;

    const balance = accountBalance(account, txs);
    if (totalDebit > balance) throw new Error("INSUFFICIENT_BALANCE");
    return balance;
}

export async function createIncome({ amount, accountId, categoryId, date, note }) {
    if (!Number.isInteger(amount) || amount <= 0) throw new Error("AMOUNT_INVALID");
    if (!accountId) throw new Error("ACCOUNT_REQUIRED");
    if (!categoryId) throw new Error("CATEGORY_REQUIRED");

    const now = new Date().toISOString();
    const tx = {
        id: crypto.randomUUID(),
        type: "income",
        amount,
        accountId,
        categoryId,
        date,
        note: (note ?? "").trim(),
        createdAt: now,
        updatedAt: now,
    };
    await db.transactions.add(await encryptRecord(TABLE, tx));
    return tx;
}

export async function createExpense({ amount, accountId, categoryId, date, note }) {
    if (!Number.isInteger(amount) || amount <= 0) throw new Error("AMOUNT_INVALID");
    if (!accountId) throw new Error("ACCOUNT_REQUIRED");
    if (!categoryId) throw new Error("CATEGORY_REQUIRED");

    await ensureSufficientBalance(accountId, amount);

    const now = new Date().toISOString();
    const tx = {
        id: crypto.randomUUID(),
        type: "expense",
        amount,
        accountId,
        categoryId,
        date,
        note: (note ?? "").trim(),
        createdAt: now,
        updatedAt: now,
    };
    await db.transactions.add(await encryptRecord(TABLE, tx));
    return tx;
}

export async function createTransfer({
    amount,
    fee,
    accountId,
    destinationAccountId,
    date,
    note,
}) {
    if (!Number.isInteger(amount) || amount <= 0) throw new Error("AMOUNT_INVALID");
    if (!Number.isInteger(fee) || fee < 0) throw new Error("FEE_INVALID");
    if (!accountId || !destinationAccountId) throw new Error("ACCOUNT_REQUIRED");
    if (accountId === destinationAccountId) throw new Error("SAME_ACCOUNT");

    await ensureSufficientBalance(accountId, amount + fee);

    const now = new Date().toISOString();
    const tx = {
        id: crypto.randomUUID(),
        type: "transfer",
        amount,
        fee,
        accountId,
        destinationAccountId,
        date,
        note: (note ?? "").trim(),
        createdAt: now,
        updatedAt: now,
    };
    await db.transactions.add(await encryptRecord(TABLE, tx));
    return tx;
}

export async function updateTransaction(id, patch) {
    const row = await db.transactions.get(id);
    if (!row) throw new Error("NOT_FOUND");
    const existing = await decryptRecord(TABLE, row);

    if (existing.type === "expense" && patch.amount != null) {
        await ensureSufficientBalance(
            patch.accountId ?? existing.accountId,
            patch.amount,
            id,
        );
    }
    if (existing.type === "transfer") {
        const amount = patch.amount ?? existing.amount;
        const fee = patch.fee ?? existing.fee ?? 0;
        const sourceId = patch.accountId ?? existing.accountId;
        await ensureSufficientBalance(sourceId, amount + fee, id);
    }

    const merged = {
        ...existing,
        ...patch,
        updatedAt: new Date().toISOString(),
    };
    await db.transactions.put(await encryptRecord(TABLE, merged));
}

export async function deleteTransaction(id) {
    await db.transactions.delete(id);
}