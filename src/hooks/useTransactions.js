import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import { decryptRecord, EncryptionNotReadyError } from "../services/encryption";

async function safeDecryptAll(tableName, rows) {
    try {
        return await Promise.all(rows.map((r) => decryptRecord(tableName, r)));
    } catch (err) {
        if (err instanceof EncryptionNotReadyError) return undefined;
        throw err;
    }
}

export function useTransaction(id) {
    const transaction = useLiveQuery(async () => {
        if (!id) return null;
        const row = await db.transactions.get(id);
        if (!row) return null;
        try {
            return await decryptRecord("transactions", row);
        } catch (err) {
            if (err instanceof EncryptionNotReadyError) return undefined;
            throw err;
        }
    }, [id]);
    return {
        transaction: transaction ?? null,
        loading: transaction === undefined,
    };
}

export function useTransactions() {
    const transactions = useLiveQuery(async () => {
        const rows = await db.transactions.orderBy("date").reverse().toArray();
        return safeDecryptAll("transactions", rows);
    }, []);
    return {
        transactions: transactions ?? [],
        loading: transactions === undefined,
    };
}

export function useCategories(type) {
    const categories = useLiveQuery(async () => {
        const rows =
            type === "income" || type === "expense"
                ? await db.categories.where("type").equals(type).toArray()
                : await db.categories.toArray();
        return safeDecryptAll("categories", rows);
    }, [type]);
    return {
        categories: categories ?? [],
        loading: categories === undefined,
    };
}

export function useLookup() {
    const accounts = useLiveQuery(async () => {
        const rows = await db.accounts.toArray();
        return safeDecryptAll("accounts", rows);
    }, []);
    const categories = useLiveQuery(async () => {
        const rows = await db.categories.toArray();
        return safeDecryptAll("categories", rows);
    }, []);

    const accountMap = useMemo(
        () => new Map(accounts?.map((a) => [a.id, a]) ?? []),
        [accounts],
    );
    const categoryMap = useMemo(
        () => new Map(categories?.map((c) => [c.id, c]) ?? []),
        [categories],
    );

    return { accountMap, categoryMap, loading: !accounts || !categories };
}