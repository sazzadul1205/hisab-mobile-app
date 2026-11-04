import { db } from "../db/db";
import {
    encryptRecord,
    decryptRecord,
} from "./encryption";

const TABLE = "accounts";

export async function listAccounts() {
    const rows = await db.accounts.toArray();
    return Promise.all(rows.map((r) => decryptRecord(TABLE, r)));
}

export async function getAccount(id) {
    if (!id) return null;
    const row = await db.accounts.get(id);
    if (!row) return null;
    return decryptRecord(TABLE, row);
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
    await db.accounts.add(await encryptRecord(TABLE, account));
    return account;
}

export async function updateAccount(id, { name, type, openingBalance }) {
    const trimmed = (name ?? "").trim();
    if (!trimmed) throw new Error("NAME_REQUIRED");
    if (openingBalance != null && !Number.isInteger(openingBalance)) {
        throw new Error("OPENING_BALANCE_INVALID");
    }

    const row = await db.accounts.get(id);
    if (!row) throw new Error("NOT_FOUND");
    const plain = await decryptRecord(TABLE, row);

    const merged = { ...plain, name: trimmed, type };
    if (openingBalance != null) merged.openingBalance = openingBalance;
    await db.accounts.put(await encryptRecord(TABLE, merged));
}

export async function setArchived(id, archived) {
    const row = await db.accounts.get(id);
    if (!row) throw new Error("NOT_FOUND");
    const plain = await decryptRecord(TABLE, row);
    const merged = { ...plain, isArchived: archived };
    await db.accounts.put(await encryptRecord(TABLE, merged));
}