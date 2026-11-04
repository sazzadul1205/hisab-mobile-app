import { db } from "../db/db";
import { accountBalance } from "./calc";

async function ensureSufficientBalance(accountId, totalDebit, excludeTxId) {
    const account = await db.accounts.get(accountId);
    if (!account) throw new Error("ACCOUNT_NOT_FOUND");

    let txs = await db.transactions.where("accountId").equals(accountId).toArray();
    const incoming = await db.transactions
        .where("destinationAccountId")
        .equals(accountId)
        .toArray();
    txs = [...txs, ...incoming];
    if (excludeTxId) txs = txs.filter((t) => t.id !== excludeTxId);

    const balance = accountBalance(account, txs);
    if (totalDebit > balance) throw new Error("INSUFFICIENT_BALANCE");
    return balance;
}

export async function createIncome({ amount, accountId, categoryId, date, note }) {
    if (!Number.isInteger(amount) || amount <= 0) {
        throw new Error("AMOUNT_INVALID");
    }
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
    await db.transactions.add(tx);
    return tx;
}

export async function createExpense({ amount, accountId, categoryId, date, note }) {
    if (!Number.isInteger(amount) || amount <= 0) {
        throw new Error("AMOUNT_INVALID");
    }
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
    await db.transactions.add(tx);
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
    if (!Number.isInteger(amount) || amount <= 0) {
        throw new Error("AMOUNT_INVALID");
    }
    if (!Number.isInteger(fee) || fee < 0) {
        throw new Error("FEE_INVALID");
    }
    if (!accountId || !destinationAccountId) {
        throw new Error("ACCOUNT_REQUIRED");
    }
    if (accountId === destinationAccountId) {
        throw new Error("SAME_ACCOUNT");
    }

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
    await db.transactions.add(tx);
    return tx;
}

export async function updateTransaction(id, patch) {
    const existing = await db.transactions.get(id);
    if (!existing) throw new Error("NOT_FOUND");

    // Re-validate balance on amount changes
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

    await db.transactions.update(id, {
        ...patch,
        updatedAt: new Date().toISOString(),
    });
}

export async function deleteTransaction(id) {
    await db.transactions.delete(id);
}