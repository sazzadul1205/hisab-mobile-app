/* ----------------------------------------------------------------
   Financial calculations.

   All amounts are integer minor units (paisa). All functions are
   pure — no DB, no React, no side effects — so they can be tested
   against the SRS business rules directly (see calc.test.js).

   Business rules implemented (see SRS §7):
     BR-03: income increases destination balance
     BR-04: expense decreases source balance
     BR-05: transfers change individual balances but not total money,
            except for any transfer fee (which is an expense)
     BR-06: net cash flow = income − expenses
     BR-11: transfer fee debits source by amount + fee, credits
            destination by amount, and counts as an expense
   ---------------------------------------------------------------- */

import { TRANSFER_FEES_CATEGORY_ID } from "../constants/categories";

/* ----------------------------------------------------------------
   Single-account balance
   ---------------------------------------------------------------- */
export function accountBalance(account, transactions) {
    if (!account) return 0;
    let balance = account.openingBalance;

    for (const tx of transactions) {
        if (tx.type === "income" && tx.accountId === account.id) {
            balance += tx.amount;
        } else if (tx.type === "expense" && tx.accountId === account.id) {
            balance -= tx.amount;
        } else if (tx.type === "transfer") {
            if (tx.accountId === account.id) {
                balance -= tx.amount + (tx.fee ?? 0);
            } else if (tx.destinationAccountId === account.id) {
                balance += tx.amount;
            }
        }
    }

    return balance;
}

/* ----------------------------------------------------------------
   All accounts at once
   ---------------------------------------------------------------- */
export function computeBalances(accounts, transactions) {
    const map = new Map();
    for (const account of accounts) {
        map.set(account.id, accountBalance(account, transactions));
    }
    return map;
}

/* ----------------------------------------------------------------
   Combined balance — excludes archived accounts (BR-07)
   ---------------------------------------------------------------- */
export function combinedBalance(accounts, transactions) {
    const balances = computeBalances(accounts, transactions);
    let total = 0;
    for (const account of accounts) {
        if (account.isArchived) continue;
        total += balances.get(account.id) ?? 0;
    }
    return total;
}

/* ----------------------------------------------------------------
   Net cash flow for a period
   Returns { income, expenses, net } in minor units.
   Transfer fees count as expenses (BR-11); the transferred amount
   itself does not (BR-05).
   ---------------------------------------------------------------- */
export function netCashFlow(transactions, { from, to } = {}) {
    let income = 0;
    let expenses = 0;

    for (const tx of transactions) {
        if (from && tx.date < from) continue;
        if (to && tx.date > to) continue;

        if (tx.type === "income") {
            income += tx.amount;
        } else if (tx.type === "expense") {
            expenses += tx.amount;
        } else if (tx.type === "transfer") {
            expenses += tx.fee ?? 0;
        }
    }

    return { income, expenses, net: income - expenses };
}

/* ----------------------------------------------------------------
   Per-category expense totals for a period
   Returns a Map<categoryId, paisa>. Transfer fees roll into the
   transfer-fees category (BR-11).
   ---------------------------------------------------------------- */
export function expensesByCategory(transactions, { from, to } = {}) {
    const map = new Map();

    for (const tx of transactions) {
        if (from && tx.date < from) continue;
        if (to && tx.date > to) continue;

        if (tx.type === "expense" && tx.categoryId) {
            map.set(tx.categoryId, (map.get(tx.categoryId) ?? 0) + tx.amount);
        } else if (tx.type === "transfer" && tx.fee > 0) {
            map.set(
                TRANSFER_FEES_CATEGORY_ID,
                (map.get(TRANSFER_FEES_CATEGORY_ID) ?? 0) + tx.fee,
            );
        }
    }

    return map;
}

/* ----------------------------------------------------------------
   Daily flow for a period — used by the dashboard chart
   Returns an array of { date: 'YYYY-MM-DD', income, expenses }
   sorted ascending by date.
   ---------------------------------------------------------------- */
export function dailyFlow(transactions, { from, to } = {}) {
    const byDate = new Map();

    for (const tx of transactions) {
        if (from && tx.date < from) continue;
        if (to && tx.date > to) continue;

        const day = tx.date.slice(0, 10);
        const existing = byDate.get(day) ?? { date: day, income: 0, expenses: 0 };

        if (tx.type === "income") {
            existing.income += tx.amount;
        } else if (tx.type === "expense") {
            existing.expenses += tx.amount;
        } else if (tx.type === "transfer") {
            existing.expenses += tx.fee ?? 0;
        }

        byDate.set(day, existing);
    }

    return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}