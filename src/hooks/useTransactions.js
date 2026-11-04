import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";

export function useTransaction(id) {
    const transaction = useLiveQuery(
        () => (id ? db.transactions.get(id) : null),
        [id],
    );
    return {
        transaction: transaction ?? null,
        loading: transaction === undefined,
    };
}

export function useTransactions() {
    const transactions = useLiveQuery(
        () => db.transactions.orderBy("date").reverse().toArray(),
        [],
    );
    return {
        transactions: transactions ?? [],
        loading: transactions === undefined,
    };
}

export function useCategories(type) {
    const categories = useLiveQuery(async () => {
        if (!type) return db.categories.toArray();
        return db.categories.where("type").equals(type).toArray();
    }, [type]);
    return {
        categories: categories ?? [],
        loading: categories === undefined,
    };
}

export function useLookup() {
    const accounts = useLiveQuery(() => db.accounts.toArray(), []);
    const categories = useLiveQuery(() => db.categories.toArray(), []);

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