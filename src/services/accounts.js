import { db } from "../db/db";

export async function listAccounts() {
    return db.accounts.toArray();
}

export async function getAccount(id) {
    if (!id) return null;
    return (await db.accounts.get(id)) ?? null;
}

export async function createAccount({ name, type, openingBalance }) {
    const trimmed = (name ?? "").trim();
    if (!trimmed) throw new Error("NAME_REQUIRED");
    if (!Number.isInteger(openingBalance)) {
        throw new Error("OPENING_BALANCE_INVALID");
    }

    const account = {
        id: crypto.randomUUID(),
        name: trimmed,
        type,
        openingBalance,
        createdAt: new Date().toISOString(),
        isArchived: false,
    };
    await db.accounts.add(account);
    return account;
}

export async function updateAccount(id, { name, type, openingBalance }) {
    const trimmed = (name ?? "").trim();
    if (!trimmed) throw new Error("NAME_REQUIRED");
    if (openingBalance != null && !Number.isInteger(openingBalance)) {
        throw new Error("OPENING_BALANCE_INVALID");
    }

    const patch = { name: trimmed, type };
    if (openingBalance != null) patch.openingBalance = openingBalance;
    await db.accounts.update(id, patch);
}

export async function setArchived(id, archived) {
    await db.accounts.update(id, { isArchived: archived });
}