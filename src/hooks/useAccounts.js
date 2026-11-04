import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import {
    computeBalances,
    combinedBalance,
    accountBalance,
} from "../services/calc";

export function useAccounts() {
    const accounts = useLiveQuery(() => db.accounts.toArray(), []);
    const transactions = useLiveQuery(() => db.transactions.toArray(), []);

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
    const account = useLiveQuery(
        () => (id ? db.accounts.get(id) : null),
        [id],
    );

    const transactions = useLiveQuery(async () => {
        if (!id) return [];
        const [asSource, asDest] = await Promise.all([
            db.transactions.where("accountId").equals(id).toArray(),
            db.transactions.where("destinationAccountId").equals(id).toArray(),
        ]);
        const map = new Map();
        for (const tx of [...asSource, ...asDest]) map.set(tx.id, tx);
        return [...map.values()].sort((a, b) => b.date.localeCompare(a.date));
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