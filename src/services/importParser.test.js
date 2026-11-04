import { describe, it, expect, beforeEach } from "vitest";
import { resetTestState } from "../test/helpers";
import { parseStatement } from "./importParser";
import { createAccount } from "./accounts";
import { createIncome } from "./transactions";

function fakeFile(name, content) {
    return {
        name,
        size: content.length,
        text: async () => content,
    };
}

let acc;

beforeEach(async () => {
    await resetTestState();
    acc = await createAccount({
        name: "bKash",
        type: "wallet",
        openingBalance: 0,
    });
});

describe("parseStatement — bKash", () => {
    it("parses a bKash-style CSV", async () => {
        const csv = [
            "Trx ID,Time,Type,Amount,Service Charge,To/From,Reference",
            "A1,2026-11-01 10:00:00,Receive,8000.00,0,01712000000,Payment",
            "B2,2026-11-02 11:00:00,Send Money,500.00,2.50,01713000000,Lunch",
        ].join("\n");

        const result = await parseStatement({
            file: fakeFile("test.csv", csv),
            accountId: acc.id,
        });

        expect(result.formatId).toBe("bkash");
        // 2 parsed + 1 fee row from Send Money
        expect(result.rows.length).toBe(3);
        expect(result.summary.invalid).toBe(0);
        const income = result.rows.find((r) => r.direction === "in");
        expect(income.amount).toBe(800000);
        const feeRow = result.rows.find((r) => r.categoryId === "exp-transfer-fees");
        expect(feeRow).toBeDefined();
        expect(feeRow.amount).toBe(250);
    });
});

describe("parseStatement — bank debit/credit", () => {
    it("parses a bank statement with debit and credit columns", async () => {
        const csv = [
            "Date,Description,Debit,Credit,Balance",
            "2026-11-01,SALARY CREDIT,,45000.00,85600.00",
            "2026-11-02,RENT PAYMENT,6000.00,,79600.00",
        ].join("\n");

        const result = await parseStatement({
            file: fakeFile("bank.csv", csv),
            accountId: acc.id,
        });

        expect(result.formatId).toBe("bank-debit-credit");
        expect(result.rows.length).toBe(2);
        const income = result.rows.find((r) => r.direction === "in");
        const expense = result.rows.find((r) => r.direction === "out");
        expect(income.amount).toBe(4500000);
        expect(expense.amount).toBe(600000);
    });
});

describe("parseStatement — generic", () => {
    it("parses signed amounts (negative = expense)", async () => {
        const csv = [
            "date,description,amount",
            "2026-11-04,Coffee shop,-250.00",
            "2026-11-04,Freelance payment,2000.00",
        ].join("\n");

        const result = await parseStatement({
            file: fakeFile("gen.csv", csv),
            accountId: acc.id,
        });

        expect(result.formatId).toBe("generic");
        const coffee = result.rows.find((r) => r.description === "Coffee shop");
        const freelance = result.rows.find((r) =>
            r.description.startsWith("Freelance"),
        );
        expect(coffee.direction).toBe("out");
        expect(coffee.amount).toBe(25000);
        expect(freelance.direction).toBe("in");
        expect(freelance.amount).toBe(200000);
    });
});

describe("parseStatement — error paths", () => {
    it("rejects unsupported format", async () => {
        const csv = "foo,bar,baz\n1,2,3";
        await expect(
            parseStatement({ file: fakeFile("x.csv", csv), accountId: acc.id }),
        ).rejects.toThrow("UNSUPPORTED_FORMAT");
    });

    it("rejects empty file", async () => {
        await expect(
            parseStatement({ file: fakeFile("x.csv", ""), accountId: acc.id }),
        ).rejects.toThrow("EMPTY_FILE");
    });

    it("rejects missing file", async () => {
        await expect(parseStatement({ file: null, accountId: acc.id })).rejects.toThrow(
            "NO_FILE",
        );
    });

    it("rejects files over the size cap", async () => {
        const fake = {
            name: "big.csv",
            size: 20 * 1024 * 1024,
            text: async () => "",
        };
        await expect(
            parseStatement({ file: fake, accountId: acc.id }),
        ).rejects.toThrow("FILE_TOO_LARGE");
    });

    it("marks rows with invalid dates", async () => {
        const csv = [
            "Trx ID,Time,Type,Amount,Service Charge,To/From,Reference",
            "A1,not-a-date,Receive,100.00,0,X,Test",
            "A2,2026-11-01 10:00:00,Receive,100.00,0,X,Test",
        ].join("\n");
        const result = await parseStatement({
            file: fakeFile("x.csv", csv),
            accountId: acc.id,
        });
        expect(result.summary.invalid).toBe(1);
        expect(result.rows.filter((r) => r.status === "invalid")).toHaveLength(1);
    });
});

describe("parseStatement — duplicate detection", () => {
    it("flags rows matching existing transactions", async () => {
        await createIncome({
            amount: 800000,
            accountId: acc.id,
            categoryId: "inc-other",
            date: "2026-11-01T10:00:00.000Z",
            note: "Payment",
        });

        const csv = [
            "Trx ID,Time,Type,Amount,Service Charge,To/From,Reference",
            "A1,2026-11-01 10:00:00,Receive,8000.00,0,X,Payment",
        ].join("\n");
        const result = await parseStatement({
            file: fakeFile("x.csv", csv),
            accountId: acc.id,
        });
        expect(result.rows[0].status).toBe("duplicate");
        expect(result.rows[0].included).toBe(false);
    });

    it("does not flag rows for a different account", async () => {
        const other = await createAccount({
            name: "Other",
            type: "bank",
            openingBalance: 0,
        });
        await createIncome({
            amount: 800000,
            accountId: other.id,
            categoryId: "inc-other",
            date: "2026-11-01T10:00:00.000Z",
            note: "Payment",
        });

        const csv = [
            "Trx ID,Time,Type,Amount,Service Charge,To/From,Reference",
            "A1,2026-11-01 10:00:00,Receive,8000.00,0,X,Payment",
        ].join("\n");
        const result = await parseStatement({
            file: fakeFile("x.csv", csv),
            accountId: acc.id,
        });
        expect(result.rows[0].status).not.toBe("duplicate");
    });
});