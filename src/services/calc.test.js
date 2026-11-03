import { describe, it, expect } from "vitest";
import {
    accountBalance,
    computeBalances,
    combinedBalance,
    netCashFlow,
    expensesByCategory,
    dailyFlow,
} from "./calc";
import { toMinor, fromMinor, parseMoney, formatBDT, isMinor } from "../lib/money";
import { TRANSFER_FEES_CATEGORY_ID } from "../constants/categories";

/* ============================================================
   Fixtures
   ------------------------------------------------------------
   Integer paisa everywhere. 1 BDT = 100 paisa.
   ============================================================ */

const ACC_CASH = {
    id: "cash",
    name: "Cash",
    type: "cash",
    openingBalance: 500000, // ৳5,000.00
    isArchived: false,
    createdAt: "2026-01-01T00:00:00Z",
};

const ACC_BKASH = {
    id: "bkash",
    name: "bKash",
    type: "wallet",
    openingBalance: 120000, // ৳1,200.00
    isArchived: false,
    createdAt: "2026-01-01T00:00:00Z",
};

const ACC_CITY = {
    id: "city",
    name: "City",
    type: "bank",
    openingBalance: 4000000, // ৳40,000.00
    isArchived: false,
    createdAt: "2026-01-01T00:00:00Z",
};

const ACC_OLD = {
    id: "old",
    name: "Old Nagad",
    type: "wallet",
    openingBalance: 500000, // ৳5,000.00
    isArchived: true,
    createdAt: "2025-01-01T00:00:00Z",
};

/* Transactions used by most tests:
   - Salary ৳45,000 → City
   - Groceries ৳850 → Cash
   - Transfer ৳5,000 City → bKash, fee ৳25
   - Freelance ৳8,000 → bKash (28 Oct)
*/
const txSalary = {
    id: "t1",
    type: "income",
    amount: 4500000,
    accountId: "city",
    categoryId: "inc-salary",
    date: "2026-10-29T08:00:00Z",
};

const txGroceries = {
    id: "t2",
    type: "expense",
    amount: 85000,
    accountId: "cash",
    categoryId: "exp-groceries",
    date: "2026-10-29T09:12:00Z",
};

const txTransfer = {
    id: "t3",
    type: "transfer",
    amount: 500000,
    fee: 2500,
    accountId: "city",
    destinationAccountId: "bkash",
    date: "2026-10-29T09:30:00Z",
};

const txFreelance = {
    id: "t4",
    type: "income",
    amount: 800000,
    accountId: "bkash",
    categoryId: "inc-freelance",
    date: "2026-10-28T16:12:00Z",
};

const ALL_TX = [txSalary, txGroceries, txTransfer, txFreelance];
const ACCOUNTS = [ACC_CASH, ACC_BKASH, ACC_CITY, ACC_OLD];

/* ============================================================
   Money
   ============================================================ */
describe("money", () => {
    it("toMinor converts BDT to integer paisa", () => {
        expect(toMinor(1)).toBe(100);
        expect(toMinor(1250)).toBe(125000);
        expect(toMinor(0.5)).toBe(50);
    });

    it("toMinor kills float drift (0.1 + 0.2)", () => {
        expect(toMinor(0.1) + toMinor(0.2)).toBe(toMinor(0.3));
    });

    it("fromMinor round-trips", () => {
        expect(fromMinor(1250)).toBe(12.5);
        expect(fromMinor(0)).toBe(0);
    });

    it("parseMoney accepts formatted strings and nulls invalid input", () => {
        expect(parseMoney("1,24,500.50")).toBe(12450050);
        expect(parseMoney("৳100")).toBe(10000);
        expect(parseMoney("−৳50.00")).toBe(-5000);
        expect(parseMoney("")).toBeNull();
        expect(parseMoney("abc")).toBeNull();
        expect(parseMoney(null)).toBeNull();
    });

    it("formatBDT uses Indian numbering and unicode minus", () => {
        expect(formatBDT(0)).toBe("৳0.00");
        expect(formatBDT(100)).toBe("৳1.00");
        expect(formatBDT(1250)).toBe("৳12.50");
        expect(formatBDT(825000)).toBe("৳8,250.00");
        expect(formatBDT(12450000)).toBe("৳1,24,500.00");
        expect(formatBDT(-5000)).toBe("−৳50.00");
    });

    it("isMinor rejects floats and non-numbers", () => {
        expect(isMinor(100)).toBe(true);
        expect(isMinor(1.5)).toBe(false);
        expect(isMinor("100")).toBe(false);
        expect(isMinor(null)).toBe(false);
    });
});

/* ============================================================
   accountBalance
   ============================================================ */
describe("accountBalance", () => {
    it("returns opening balance when no transactions touch the account", () => {
        expect(accountBalance(ACC_CASH, [])).toBe(ACC_CASH.openingBalance);
    });

    it("returns 0 for a null account", () => {
        expect(accountBalance(null, ALL_TX)).toBe(0);
    });

    it("income increases destination balance (BR-03)", () => {
        const balance = accountBalance(ACC_CITY, [txSalary]);
        expect(balance).toBe(4000000 + 4500000);
    });

    it("expense decreases source balance (BR-04)", () => {
        const balance = accountBalance(ACC_CASH, [txGroceries]);
        expect(balance).toBe(500000 - 85000);
    });

    it("transfer debits source by amount + fee, credits dest by amount (BR-11)", () => {
        const cityBal = accountBalance(ACC_CITY, [txTransfer]);
        const bkashBal = accountBalance(ACC_BKASH, [txTransfer]);
        expect(cityBal).toBe(4000000 - 500000 - 2500); // −৳5,025.00
        expect(bkashBal).toBe(120000 + 500000); // +৳5,000.00
    });

    it("transfer without a fee leaves no trace on combined balance", () => {
        const transferNoFee = { ...txTransfer, fee: 0 };
        const cityBal = accountBalance(ACC_CITY, [transferNoFee]);
        const bkashBal = accountBalance(ACC_BKASH, [transferNoFee]);
        const opening = ACC_CITY.openingBalance + ACC_BKASH.openingBalance;
        expect(cityBal + bkashBal).toBe(opening);
    });

    it("ignores transactions on other accounts", () => {
        expect(accountBalance(ACC_CASH, [txSalary])).toBe(ACC_CASH.openingBalance);
    });

    it("combines all touching transactions correctly", () => {
        // Cash: opening − groceries only
        expect(accountBalance(ACC_CASH, ALL_TX)).toBe(500000 - 85000);
        // bKash: opening + transfer-in + freelance
        expect(accountBalance(ACC_BKASH, ALL_TX)).toBe(120000 + 500000 + 800000);
        // City: opening + salary − (transfer + fee)
        expect(accountBalance(ACC_CITY, ALL_TX)).toBe(
            4000000 + 4500000 - 500000 - 2500,
        );
    });
});

/* ============================================================
   computeBalances
   ============================================================ */
describe("computeBalances", () => {
    it("returns a Map keyed by account id", () => {
        const balances = computeBalances(ACCOUNTS, ALL_TX);
        expect(balances.size).toBe(ACCOUNTS.length);
        expect(balances.get("cash")).toBe(500000 - 85000);
        expect(balances.get("bkash")).toBe(120000 + 500000 + 800000);
        expect(balances.get("city")).toBe(4000000 + 4500000 - 500000 - 2500);
    });

    it("archived accounts still compute a balance", () => {
        const balances = computeBalances(ACCOUNTS, ALL_TX);
        expect(balances.get("old")).toBe(ACC_OLD.openingBalance);
    });
});

/* ============================================================
   combinedBalance
   ============================================================ */
describe("combinedBalance", () => {
    it("sums only active accounts (BR-07)", () => {
        const total = combinedBalance(ACCOUNTS, ALL_TX);
        const cash = 500000 - 85000;
        const bkash = 120000 + 500000 + 800000;
        const city = 4000000 + 4500000 - 500000 - 2500;
        expect(total).toBe(cash + bkash + city);
    });

    it("excludes archived accounts even if they have non-zero balance", () => {
        const totalWithoutOld = combinedBalance(
            ACCOUNTS.filter((a) => !a.isArchived),
            ALL_TX,
        );
        expect(totalWithoutOld).toBe(combinedBalance(ACCOUNTS, ALL_TX));
    });

    it("returns 0 when all accounts are archived", () => {
        const allArchived = ACCOUNTS.map((a) => ({ ...a, isArchived: true }));
        expect(combinedBalance(allArchived, ALL_TX)).toBe(0);
    });
});

/* ============================================================
   netCashFlow
   ============================================================ */
describe("netCashFlow", () => {
    it("income − expenses (BR-06), transfers excluded except fees", () => {
        const flow = netCashFlow(ALL_TX);
        expect(flow.income).toBe(4500000 + 800000);
        expect(flow.expenses).toBe(85000 + 2500); // fee counts
        expect(flow.net).toBe(4500000 + 800000 - 85000 - 2500);
    });

    it("respects date range (inclusive lower, exclusive-at-day-end upper)", () => {
        const flow = netCashFlow(ALL_TX, {
            from: "2026-10-29T00:00:00Z",
            to: "2026-10-29T23:59:59Z",
        });
        expect(flow.income).toBe(4500000); // only salary
        expect(flow.expenses).toBe(85000 + 2500); // groceries + fee
    });

    it("returns zeros for empty input", () => {
        const flow = netCashFlow([]);
        expect(flow).toEqual({ income: 0, expenses: 0, net: 0 });
    });

    it("transfer without a fee contributes nothing", () => {
        const flow = netCashFlow([{ ...txTransfer, fee: 0 }]);
        expect(flow.income).toBe(0);
        expect(flow.expenses).toBe(0);
        expect(flow.net).toBe(0);
    });

    it("negative net flow is allowed", () => {
        const flow = netCashFlow([txGroceries]);
        expect(flow.net).toBe(-85000);
    });
});

/* ============================================================
   expensesByCategory
   ============================================================ */
describe("expensesByCategory", () => {
    it("groups expenses by categoryId", () => {
        const map = expensesByCategory(ALL_TX);
        expect(map.get("exp-groceries")).toBe(85000);
    });

    it("rolls transfer fees into the transfer-fees category", () => {
        const map = expensesByCategory(ALL_TX);
        expect(map.get(TRANSFER_FEES_CATEGORY_ID)).toBe(2500);
    });

    it("does not include transfers without a fee", () => {
        const map = expensesByCategory([{ ...txTransfer, fee: 0 }]);
        expect(map.size).toBe(0);
    });

    it("respects date range", () => {
        const map = expensesByCategory(ALL_TX, {
            from: "2026-10-29T00:00:00Z",
            to: "2026-10-29T23:59:59Z",
        });
        expect(map.get("exp-groceries")).toBe(85000);
        expect(map.get(TRANSFER_FEES_CATEGORY_ID)).toBe(2500);
    });
});

/* ============================================================
   dailyFlow
   ============================================================ */
describe("dailyFlow", () => {
    it("aggregates income and expenses per day, sorted ascending", () => {
        const days = dailyFlow(ALL_TX);
        expect(days).toHaveLength(2);
        expect(days[0].date).toBe("2026-10-28");
        expect(days[0].income).toBe(800000);
        expect(days[0].expenses).toBe(0);
        expect(days[1].date).toBe("2026-10-29");
        expect(days[1].income).toBe(4500000);
        expect(days[1].expenses).toBe(85000 + 2500);
    });

    it("returns an empty array for no transactions", () => {
        expect(dailyFlow([])).toEqual([]);
    });
});