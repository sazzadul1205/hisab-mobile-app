import { format } from "date-fns";
import { db } from "../db/db";
import { decryptRecord } from "./encryption";
import { fromMinor } from "../lib/money";

const HEADERS = [
    "Date",
    "Type",
    "Amount (BDT)",
    "Fee (BDT)",
    "Account",
    "Destination Account",
    "Category",
    "Note",
    "Created At",
    "Updated At",
];

function neutralizeFormula(s) {
    // Prevent CSV formula injection in spreadsheet apps: prefix any cell
    // that starts with a dangerous character with a single quote.
    if (/^[=+\-@\t\r]/.test(s)) {
        return "'" + s;
    }
    return s;
}

function csvEscape(value) {
    const s = neutralizeFormula(String(value ?? ""));
    if (s.includes(",") || s.includes('"') || s.includes("\\n")) {
        return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
}

function row(cells) {
    return cells.map(csvEscape).join(",");
}

export async function buildCsvExport() {
    const [accounts, transactions, categories] = await Promise.all([
        db.accounts.toArray(),
        db.transactions.orderBy("date").toArray(),
        db.categories.toArray(),
    ]);

    const [decAccounts, decTxs, decCats] = await Promise.all([
        Promise.all(accounts.map((r) => decryptRecord("accounts", r))),
        Promise.all(transactions.map((r) => decryptRecord("transactions", r))),
        Promise.all(categories.map((r) => decryptRecord("categories", r))),
    ]);

    const accMap = new Map(decAccounts.map((a) => [a.id, a]));
    const catMap = new Map(decCats.map((c) => [c.id, c]));

    const lines = [row(HEADERS)];
    for (const tx of decTxs) {
        lines.push(
            row([
                format(new Date(tx.date), "yyyy-MM-dd HH:mm:ss"),
                tx.type,
                fromMinor(tx.amount).toFixed(2),
                tx.fee != null ? fromMinor(tx.fee).toFixed(2) : "",
                accMap.get(tx.accountId)?.name ?? "",
                tx.destinationAccountId
                    ? accMap.get(tx.destinationAccountId)?.name ?? ""
                    : "",
                catMap.get(tx.categoryId)?.name ?? "",
                tx.note ?? "",
                format(new Date(tx.createdAt), "yyyy-MM-dd HH:mm:ss"),
                format(new Date(tx.updatedAt), "yyyy-MM-dd HH:mm:ss"),
            ]),
        );
    }

    return {
        csv: lines.join("\n") + "\n",
        filename: `hisab-export-${format(new Date(), "yyyy-MM-dd")}.csv`,
        counts: {
            transactions: decTxs.length,
            accounts: decAccounts.length,
            categories: decCats.length,
        },
    };
}