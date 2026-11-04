import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import {
    computeBalances,
    combinedBalance,
    accountBalance,
} from "../services/calc";
import { decryptRecord, EncryptionNotReadyError } from "../services/encryption";

/* Try to decrypt; return undefined if the vault is momentarily
   locked, so pages show a skeleton instead of throwing. Any other
   error propagates (corrupted data should surface, not hide). */
async function safeDecryptAll(tableName, rows) {
    try {
        return await Promise.all(rows.map((r) => decryptRecord(tableName, r)));
    } catch (err) {
        if (err instanceof EncryptionNotReadyError) return undefined;
        throw err;
    }
}

export function useAccounts() {
    const accounts = useLiveQuery(async () => {
        const rows = await db.accounts.toArray();
        return safeDecryptAll("accounts", rows);
    }, []);

    const transactions = useLiveQuery(async () => {
        const rows = await db.transactions.toArray();
        return safeDecryptAll("transactions", rows);
    }, []);

    const balances = useMemo(() => {
        if (!accounts || !transactions) return new Map();
        return computeBalances(accounts, transactions);
    }, [accounts, transactions]);

    const combined = useMemo(() => {
        if (!accounts || !transactions) return 0;
        return combinedBalance(accounts, transactions);
    }, [accounts, transactions]);

    return {
        accounts: accounts ?? [],
        transactions: transactions ?? [],
        balances,
        combined,
        loading: accounts === undefined || transactions === undefined,
    };
}

export function useAccount(id) {
    const account = useLiveQuery(async () => {
        if (!id) return null;
        const row = await db.accounts.get(id);
        if (!row) return null;
        try {
            return await decryptRecord("accounts", row);
        } catch (err) {
            if (err instanceof EncryptionNotReadyError) return undefined;
            throw err;
        }
    }, [id]);

    const transactions = useLiveQuery(async () => {
        if (!id) return [];
        const [srcRows, dstRows] = await Promise.all([
            db.transactions.where("accountId").equals(id).toArray(),
            db.transactions.where("destinationAccountId").equals(id).toArray(),
        ]);
        const map = new Map();
        for (const r of [...srcRows, ...dstRows]) map.set(r.id, r);
        const rows = [...map.values()];
        try {
            const decrypted = await Promise.all(
                rows.map((r) => decryptRecord("transactions", r)),
            );
            return decrypted.sort((a, b) => b.date.localeCompare(a.date));
        } catch (err) {
            if (err instanceof EncryptionNotReadyError) return undefined;
            throw err;
        }
    }, [id]);

    const balance = useMemo(() => {
        if (!account || !transactions) return 0;
        return accountBalance(account, transactions);
    }, [account, transactions]);

    return {
        account: account ?? null,
        transactions: transactions ?? [],
        balance,
        loading: account === undefined || transactions === undefined,
    };
}