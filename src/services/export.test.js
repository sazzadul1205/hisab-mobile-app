import { describe, it, expect, beforeEach } from "vitest";
import { resetTestState } from "../test/helpers";
import { createAccount } from "./accounts";
import { createIncome, createExpense, createTransfer } from "./transactions";
import { buildCsvExport } from "./export";
import { createCategory } from "./categories";

beforeEach(resetTestState);

describe("buildCsvExport", () => {
    it("returns header-only CSV when no transactions exist", async () => {
        const { csv, counts } = await buildCsvExport();
        expect(counts.transactions).toBe(0);
        const lines = csv.trim().split("\n");
        expect(lines).toHaveLength(1); // header only
        expect(lines[0]).toContain("Date");
        expect(lines[0]).toContain("Amount (BDT)");
    });

    it("includes all transactions with resolved account and category names", async () => {
        const acc = await createAccount({
            name: "Cash",
            type: "cash",
            openingBalance: 500000,
        });
        const salaryCat = await createCategory({ name: "Salary", type: "income" });
        const groceriesCat = await createCategory({
            name: "Groceries",
            type: "expense",
        });

        await createIncome({
            amount: 100000,
            accountId: acc.id,
            categoryId: salaryCat.id,
            date: "2026-11-04T10:00:00.000Z",
            note: "Monthly",
        });
        await createExpense({
            amount: 25000,
            accountId: acc.id,
            categoryId: groceriesCat.id,
            date: "2026-11-04T11:00:00.000Z",
            note: "Milk",
        });

        const { csv, counts } = await buildCsvExport();
        expect(counts.transactions).toBe(2);
        const lines = csv.trim().split("\n");
        expect(lines).toHaveLength(3); // header + 2 rows
        expect(csv).toContain("Cash");
        expect(csv).toContain("Salary");
        expect(csv).toContain("Groceries");
        expect(csv).toContain("Monthly");
    });


    it("includes destination account and fee for transfers", async () => {
        const a = await createAccount({
            name: "Bank",
            type: "bank",
            openingBalance: 1000000,
        });
        const b = await createAccount({
            name: "bKash",
            type: "wallet",
            openingBalance: 0,
        });
        await createTransfer({
            amount: 100000,
            fee: 2500,
            accountId: a.id,
            destinationAccountId: b.id,
            date: "2026-11-04T10:00:00.000Z",
            note: "Move to wallet",
        });

        const { csv } = await buildCsvExport();
        expect(csv).toContain("Bank");
        expect(csv).toContain("bKash");
        // Amount 1000.00 and fee 25.00
        expect(csv).toContain("1000.00");
        expect(csv).toContain("25.00");
    });

    it("escapes commas and quotes in notes", async () => {
        const acc = await createAccount({
            name: "Cash",
            type: "cash",
            openingBalance: 500000,
        });
        await createExpense({
            amount: 1000,
            accountId: acc.id,
            categoryId: "exp-other",
            date: "2026-11-04T10:00:00.000Z",
            note: 'Lunch, "with tea"',
        });

        const { csv } = await buildCsvExport();
        expect(csv).toContain('"Lunch, ""with tea"""');
    });

    it("produces a filename with today's date", async () => {
        const { filename } = await buildCsvExport();
        expect(filename).toMatch(/^hisab-export-\d{4}-\d{2}-\d{2}\.csv$/);
    });
});