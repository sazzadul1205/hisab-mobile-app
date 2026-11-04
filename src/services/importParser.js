/* ----------------------------------------------------------------
   Statement parsing.

   Format detection by header row, then per-format row parsing.
   Duplicate detection against existing (encrypted) transactions on
   the destination account.

   Adding a new bank = add one entry to FORMATS. No changes to the
   UI or the commit path.
   ---------------------------------------------------------------- */

import { parse as parseDate, isValid } from "date-fns";
import { parseMoney } from "../lib/money";
import { db } from "../db/db";
import { decryptRecord } from "./encryption";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB cap
const DESCRIPTION_PREVIEW_LEN = 60;

/* ----------------------------------------------------------------
   Keyword → category mapping (used for auto-suggestion).
   Fallback is not auto-applied — user must choose.
   ---------------------------------------------------------------- */
const INCOME_KEYWORDS = [
    [/\b(salary|payroll)\b/i, "inc-salary"],
    [/\b(freelance|client\s*payment)\b/i, "inc-freelance"],
    [/\b(refund|cashback)\b/i, "inc-other"],
    [/\b(gift)\b/i, "inc-gift"],
];

const EXPENSE_KEYWORDS = [
    [/\b(grocer|market|bazar)\b/i, "exp-groceries"],
    [/\b(rent|landlord)\b/i, "exp-rent"],
    [/\b(bill|electricity|gas|water|internet|desco|wasa|link3|ptcl)\b/i, "exp-bills"],
    [/\b(uber|rickshaw|cng|bus|train|pathao|taxi|ride)\b/i, "exp-transport"],
    [/\b(food|restaurant|cafe|dining)\b/i, "exp-food"],
    [/\b(pharma|medicine|doctor|hospital|clinic|health)\b/i, "exp-health"],
    [/\b(charge|fee)\b/i, "exp-transfer-fees"],
];

function suggestCategory(direction, description) {
    const list = direction === "in" ? INCOME_KEYWORDS : EXPENSE_KEYWORDS;
    for (const [re, id] of list) {
        if (re.test(description)) return id;
    }
    return null;
}

/* ----------------------------------------------------------------
   CSV parsing (RFC-4180-ish: quotes, escaped quotes, CRLF, BOM)
   ---------------------------------------------------------------- */
function stripBom(text) {
    return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

function detectDelimiter(headerLine) {
    if (headerLine.includes("\t")) return "\t";
    if (headerLine.includes(";") && !headerLine.includes(",")) return ";";
    return ",";
}

function parseCsv(text) {
    const clean = stripBom(text);
    const firstNl = clean.indexOf("\n");
    const headerLine = firstNl >= 0 ? clean.slice(0, firstNl) : clean;
    const delim = detectDelimiter(headerLine);

    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;
    let i = 0;

    while (i < clean.length) {
        const ch = clean[i];
        if (inQuotes) {
            if (ch === '"' && clean[i + 1] === '"') {
                field += '"';
                i += 2;
                continue;
            }
            if (ch === '"') {
                inQuotes = false;
                i += 1;
                continue;
            }
            field += ch;
            i += 1;
        } else {
            if (ch === '"') {
                inQuotes = true;
                i += 1;
                continue;
            }
            if (ch === delim) {
                row.push(field);
                field = "";
                i += 1;
                continue;
            }
            if (ch === "\r") {
                i += 1;
                continue;
            }
            if (ch === "\n") {
                row.push(field);
                if (row.some((c) => c.length > 0)) rows.push(row);
                row = [];
                field = "";
                i += 1;
                continue;
            }
            field += ch;
            i += 1;
        }
    }
    if (field.length > 0 || row.length > 0) {
        row.push(field);
        if (row.some((c) => c.length > 0)) rows.push(row);
    }
    return rows;
}

/* ----------------------------------------------------------------
   Date parsing — tries several common formats, falls back to native
   ---------------------------------------------------------------- */
const DATE_FORMATS = [
    "yyyy-MM-dd HH:mm:ss",
    "yyyy-MM-dd'T'HH:mm:ss",
    "yyyy-MM-dd HH:mm",
    "yyyy-MM-dd",
    "dd/MM/yyyy HH:mm:ss",
    "dd/MM/yyyy HH:mm",
    "dd/MM/yyyy",
    "dd-MM-yyyy HH:mm:ss",
    "dd-MM-yyyy",
    "MMM d, yyyy",
    "MMM d yyyy",
];

function parseAnyDate(str) {
    if (!str) return null;
    const s = String(str).trim();
    if (!s) return null;
    for (const fmt of DATE_FORMATS) {
        const d = parseDate(s, fmt, new Date());
        if (isValid(d)) return d;
    }
    const native = new Date(s);
    return Number.isNaN(native.getTime()) ? null : native;
}

/* ----------------------------------------------------------------
   Column matcher — finds a value by regex against the header row
   ---------------------------------------------------------------- */
function col(row, headers, pattern) {
    for (let i = 0; i < headers.length; i++) {
        if (pattern.test(headers[i])) return row[i];
    }
    return undefined;
}

/* ----------------------------------------------------------------
   Format registry
   ---------------------------------------------------------------- */
const FORMATS = [
    {
        id: "bkash",
        name: "bKash",
        match: (headers) =>
            headers.some((h) => /trx\s*id/i.test(h)) &&
            headers.some((h) => /(time|date)/i.test(h)) &&
            headers.some((h) => /amount/i.test(h)),
        parse: (row, headers) => {
            const dateStr = col(row, headers, /(time|date)/i);
            const amountStr = col(row, headers, /amount/i);
            const typeStr = col(row, headers, /(type|transaction\s*type)/i) ?? "";
            const feeStr = col(row, headers, /(service\s*charge|fee)/i);
            const descStr =
                col(row, headers, /(reference|to\/from|description|to\s*\/\s*from|details)/i) ??
                "";

            const date = parseAnyDate(dateStr);
            const amount = parseMoney(amountStr);
            const fee = parseMoney(feeStr) ?? 0;

            if (!date) throw new Error("Invalid date");
            if (amount == null || amount === 0) throw new Error("Invalid amount");

            const inKeywords = /\b(receive|cash\s*in|add\s*money|refund|received|deposit)\b/i;
            const direction = inKeywords.test(typeStr) || inKeywords.test(descStr)
                ? "in"
                : "out";

            return {
                date: date.toISOString(),
                amount: Math.abs(amount),
                direction,
                description:
                    (descStr || "").trim() ||
                    (typeStr || "").trim() ||
                    "bKash transaction",
                fee: fee > 0 ? fee : 0,
            };
        },
    },
    {
        id: "bank-debit-credit",
        name: "Bank statement",
        match: (headers) =>
            headers.some((h) => /\bdate\b/i.test(h)) &&
            headers.some((h) => /\bdebit\b/i.test(h)) &&
            headers.some((h) => /\bcredit\b/i.test(h)),
        parse: (row, headers) => {
            const dateStr = col(row, headers, /\bdate\b/i);
            const debitStr = col(row, headers, /\bdebit\b/i);
            const creditStr = col(row, headers, /\bcredit\b/i);
            const descStr = col(row, headers, /(description|narration|details|memo)/i) ?? "";

            const date = parseAnyDate(dateStr);
            if (!date) throw new Error("Invalid date");

            const debit = parseMoney(debitStr);
            const credit = parseMoney(creditStr);

            let amount;
            let direction;
            if (debit != null && debit > 0) {
                amount = debit;
                direction = "out";
            } else if (credit != null && credit > 0) {
                amount = credit;
                direction = "in";
            } else {
                throw new Error("No debit or credit");
            }

            return {
                date: date.toISOString(),
                amount,
                direction,
                description: (descStr || "").trim() || "(no description)",
                fee: 0,
            };
        },
    },
    {
        id: "generic",
        name: "Generic CSV",
        match: (headers) =>
            headers.some((h) => /\bdate\b/i.test(h)) &&
            headers.some((h) => /amount/i.test(h)),
        parse: (row, headers) => {
            const dateStr = col(row, headers, /\bdate\b/i);
            const amountStr = col(row, headers, /amount/i);
            const descStr =
                col(row, headers, /(description|memo|note|reference|narration)/i) ?? "";

            const date = parseAnyDate(dateStr);
            const signed = parseMoney(amountStr);
            if (!date) throw new Error("Invalid date");
            if (signed == null || signed === 0) throw new Error("Invalid amount");

            return {
                date: date.toISOString(),
                amount: Math.abs(signed),
                direction: signed < 0 ? "out" : "in",
                description: (descStr || "").trim() || "(no description)",
                fee: 0,
            };
        },
    },
];

function detectFormat(headers) {
    return FORMATS.find((f) => f.match(headers)) ?? null;
}

/* ----------------------------------------------------------------
   Duplicate detection — signature from (date-day, direction,
   amount, description prefix). Legitimate duplicates exist (two
   ৳100 groceries same day) so this flags, never auto-excludes.
   ---------------------------------------------------------------- */
function signature({ date, direction, amount, description }) {
    const day = date.slice(0, 10);
    const desc = (description ?? "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, DESCRIPTION_PREVIEW_LEN);
    return `${day}|${direction}|${amount}|${desc}`;
}

async function buildExistingSignatures(accountId) {
    const [srcRows, dstRows] = await Promise.all([
        db.transactions.where("accountId").equals(accountId).toArray(),
        db.transactions.where("destinationAccountId").equals(accountId).toArray(),
    ]);
    const map = new Map();
    for (const r of [...srcRows, ...dstRows]) {
        try {
            const t = await decryptRecord("transactions", r);
            if (t.type === "transfer") continue;
            const sig = signature({
                date: t.date,
                direction: t.type === "income" ? "in" : "out",
                amount: t.amount,
                description: t.note ?? "",
            });
            map.set(sig, (map.get(sig) ?? 0) + 1);
        } catch {
            // Skip records we can't decrypt (vault momentarily locked) — user
            // will re-run import once unlocked if it matters.
        }
    }
    return map;
}

/* ----------------------------------------------------------------
   Public API
   ---------------------------------------------------------------- */
let seq = 0;
const nextId = () => `import-row-${++seq}`;

export async function parseStatement({ file, accountId }) {
    if (!file) throw new Error("NO_FILE");
    if (file.size > MAX_FILE_BYTES) throw new Error("FILE_TOO_LARGE");

    const text = await file.text();
    const table = parseCsv(text);
    if (table.length < 2) throw new Error("EMPTY_FILE");

    const [headerRow, ...dataRows] = table;
    const headers = headerRow.map((h) => h.trim());

    const format = detectFormat(headers);
    if (!format) throw new Error("UNSUPPORTED_FORMAT");

    const existingSigs = await buildExistingSignatures(accountId);

    const rows = [];
    for (const rawRow of dataRows) {
        if (rawRow.every((c) => !c || c.trim() === "")) continue;

        let base;
        try {
            base = format.parse(rawRow, headers);
        } catch (err) {
            rows.push({
                id: nextId(),
                status: "invalid",
                included: false,
                error: err.message || "Could not parse row",
                raw: rawRow,
                description: rawRow.join(" ").slice(0, 80),
            });
            continue;
        }

        // Main row
        const sig = signature(base);
        const seenInFile = rows.filter(
            (r) =>
                r.status !== "invalid" &&
                r._sig === sig,
        ).length;
        const existingCount = existingSigs.get(sig) ?? 0;
        const isDuplicate = existingCount > 0 || seenInFile > 0;

        const category = suggestCategory(base.direction, base.description);
        const status = !category
            ? "needs-category"
            : isDuplicate
                ? "duplicate"
                : "ok";

        rows.push({
            id: nextId(),
            status,
            included: status !== "duplicate" && status !== "invalid",
            error: null,
            raw: rawRow,
            description: base.description,
            date: base.date,
            direction: base.direction,
            amount: base.amount,
            fee: base.fee,
            categoryId: category,
            _sig: sig,
        });

        // If bKash provided a service charge, add it as a separate
        // "Transfer fees" expense — honest accounting, one row per
        // real ledger entry.
        if (base.fee > 0) {
            const feeRow = {
                date: base.date,
                direction: "out",
                amount: base.fee,
                description: `Fee for: ${base.description}`,
                fee: 0,
            };
            const feeSig = signature(feeRow);
            rows.push({
                id: nextId(),
                status: "ok",
                included: true,
                error: null,
                raw: rawRow,
                description: feeRow.description,
                date: feeRow.date,
                direction: feeRow.direction,
                amount: feeRow.amount,
                fee: 0,
                categoryId: "exp-transfer-fees",
                _sig: feeSig,
            });
        }
    }

    const summary = {
        parsed: rows.length,
        flagged: rows.filter((r) => r.status === "duplicate" || r.status === "needs-category").length,
        invalid: rows.filter((r) => r.status === "invalid").length,
        included: rows.filter((r) => r.included && r.categoryId).length,
    };

    return {
        formatId: format.id,
        formatName: format.name,
        fileName: file.name,
        rows,
        summary,
        accountId,
    };
}

/** True if the file extension looks like a CSV. Advisory only —
    the parser will reject anything that doesn't match a format. */
export function looksLikeCsv(file) {
    const name = (file?.name ?? "").toLowerCase();
    return name.endsWith(".csv") || name.endsWith(".txt");
}