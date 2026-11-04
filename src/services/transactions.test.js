import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../db/db";
import { resetTestState } from "../test/helpers";
import { createAccount } from "./accounts";
import {
    createIncome,
    createExpense,
    createTransfer,
    updateTransaction,
    deleteTransaction,
} from "./transactions";
import { accountBalance } from "./calc";
import { decryptRecord } from "./encryption";
import { listAccounts } from "./accounts";

let accA, accB;

beforeEach(async () => {
    await resetTestState();
    accA = await createAccount({
        name: "Cash",
        type: "cash",
        openingBalance: 500000,
    });
    accB = await createAccount({
        name: "Bank",
        type: "bank",
        openingBalance: 1000000,
    });
});

const baseIncome = (overrides = {}) => ({
    amount: 100000,
    accountId: accA.id,
    categoryId: "inc-salary",
    date: new Date().toISOString(),
    note: "Test",
    ...overrides,
});

describe("createIncome", () => {
    it("creates a valid income transaction", async () => {
        const tx = await createIncome(baseIncome());
        expect(tx.id).toBeTruthy();
        expect(tx.type).toBe("income");
        expect(tx.amount).toBe(100000);
    });

    it("rejects zero amount", async () => {
        await expect(createIncome(baseIncome({ amount: 0 }))).rejects.toThrow(
            "AMOUNT_INVALID",
        );
    });

    it("rejects non-integer amount", async () => {
        await expect(createIncome(baseIncome({ amount: 10.5 }))).rejects.toThrow(
            "AMOUNT_INVALID",
        );
    });

    it("rejects missing accountId", async () => {
        await expect(createIncome(baseIncome({ accountId: "" }))).rejects.toThrow(
            "ACCOUNT_REQUIRED",
        );
    });

    it("rejects missing categoryId", async () => {
        await expect(createIncome(baseIncome({ categoryId: "" }))).rejects.toThrow(
            "CATEGORY_REQUIRED",
        );
    });

    it("stores the row encrypted with type and accountId plaintext", async () => {
        const tx = await createIncome(baseIncome());
        const raw = await db.transactions.get(tx.id);
        expect(raw.enc).toBeDefined();
        expect(raw.amount).toBeUndefined();
        expect(raw.note).toBeUndefined();
        expect(raw.type).toBe("income");
        expect(raw.accountId).toBe(accA.id);
    });
});

describe("createExpense", () => {
    const base = (overrides = {}) => ({
        amount: 50000,
        accountId: accA.id,
        categoryId: "exp-groceries",
        date: new Date().toISOString(),
        note: "Test",
        ...overrides,
    });

    it("creates a valid expense", async () => {
        const tx = await createExpense(base());
        expect(tx.type).toBe("expense");
    });

    it("rejects when amount exceeds balance", async () => {
        await expect(createExpense(base({ amount: 500001 }))).rejects.toThrow(
            "INSUFFICIENT_BALANCE",
        );
    });

    it("allows expense exactly equal to balance", async () => {
        const tx = await createExpense(base({ amount: 500000 }));
        expect(tx.amount).toBe(500000);
    });

    it("allows expense after income increases the balance", async () => {
        await createIncome(baseIncome({ amount: 100000 }));
        const tx = await createExpense(base({ amount: 550000 }));
        expect(tx.amount).toBe(550000);
    });
});

describe("createTransfer", () => {
    const base = (overrides = {}) => ({
        amount: 100000,
        fee: 0,
        accountId: accA.id,
        destinationAccountId: accB.id,
        date: new Date().toISOString(),
        note: "Test",
        ...overrides,
    });

    it("creates a valid transfer", async () => {
        const tx = await createTransfer(base());
        expect(tx.type).toBe("transfer");
        expect(tx.amount).toBe(100000);
        expect(tx.fee).toBe(0);
    });

    it("rejects when source equals destination", async () => {
        await expect(
            createTransfer(base({ destinationAccountId: accA.id })),
        ).rejects.toThrow("SAME_ACCOUNT");
    });

    it("rejects negative fee", async () => {
        await expect(createTransfer(base({ fee: -1 }))).rejects.toThrow(
            "FEE_INVALID",
        );
    });

    it("checks balance against amount + fee", async () => {
        // Balance is 500000, amount 490000 + fee 20000 > 500000
        await expect(
            createTransfer(base({ amount: 490000, fee: 20000 })),
        ).rejects.toThrow("INSUFFICIENT_BALANCE");
    });

    it("allows transfer where amount + fee equals balance", async () => {
        const tx = await createTransfer(base({ amount: 490000, fee: 10000 }));
        expect(tx.amount).toBe(490000);
        expect(tx.fee).toBe(10000);
    });

    it("updates both balances per BR-11", async () => {
        await createTransfer(base({ amount: 100000, fee: 2500 }));
        const balances = await listBalances();
        // Cash: 500000 - 100000 - 2500 = 397500
        // Bank: 1000000 + 100000 = 1100000
        expect(balances.get(accA.id)).toBe(397500);
        expect(balances.get(accB.id)).toBe(1100000);
    });
});

async function listBalances() {
    const accounts = await listAccounts();
    const rows = await db.transactions.toArray();
    const txs = await Promise.all(
        rows.map((r) => decryptRecord("transactions", r)),
    );
    const map = new Map();
    for (const a of accounts) map.set(a.id, accountBalance(a, txs));
    return map;
}

describe("updateTransaction", () => {
    it("updates amount on an expense", async () => {
        const tx = await createExpense({
            amount: 1000,
            accountId: accA.id,
            categoryId: "exp-groceries",
            date: new Date().toISOString(),
            note: "x",
        });
        await updateTransaction(tx.id, { amount: 2000 });
        const raw = await db.transactions.get(tx.id);
        const updated = await decryptRecord("transactions", raw);
        expect(updated.amount).toBe(2000);
    });

    it("throws on missing transaction", async () => {
        await expect(updateTransaction("nope", { amount: 1 })).rejects.toThrow(
            "NOT_FOUND",
        );
    });

    it("re-validates balance on expense amount increase", async () => {
        const tx = await createExpense({
            amount: 1000,
            accountId: accA.id,
            categoryId: "exp-groceries",
            date: new Date().toISOString(),
            note: "x",
        });
        await expect(updateTransaction(tx.id, { amount: 500001 })).rejects.toThrow(
            "INSUFFICIENT_BALANCE",
        );
    });
});

describe("deleteTransaction", () => {
    it("removes the row", async () => {
        const tx = await createIncome(baseIncome());
        await deleteTransaction(tx.id);
        expect(await db.transactions.get(tx.id)).toBeUndefined();
    });
});