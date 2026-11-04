/* ----------------------------------------------------------------
   Money primitives.

   All amounts are stored and computed as integer minor units (paisa).
   1 BDT = 100 paisa. Floats never touch the ledger — only formatting
   converts to a human display string.
   ---------------------------------------------------------------- */

const UNICODE_MINUS = "\u2212"; // −

/**
 * Convert a user-facing number (BDT, may have decimals) to integer paisa.
 * Uses Math.round to handle float drift from places like 0.1 + 0.2.
 */
export function toMinor(amount) {
  return Math.round(Number(amount) * 100);
}

/**
 * Convert integer paisa to a number (BDT). For display only — do not
 * feed the result back into arithmetic; go via toMinor instead.
 */
export function fromMinor(minor) {
  return minor / 100;
}

/**
 * Parse a form input string like "1,24,500.50" or "৳100" into paisa.
 * Returns null for empty/invalid input.
 */
export function parseMoney(input) {
  if (input == null || input === "") return null;
  let s = String(input).trim();
  s = s.replace(/[৳,\s]/g, "");
  s = s.replace(/\u2212/g, "-"); // normalize unicode minus to ASCII
  const num = Number(s);
  if (!Number.isFinite(num)) return null;
  return Math.round(num * 100);
}

/**
 * Format integer paisa as a BDT string with Indian numbering
 * (lakh/crore comma grouping) and 2-decimal paisa.
 *
 *   formatBDT(0)        → "৳0.00"
 *   formatBDT(1250)     → "৳12.50"
 *   formatBDT(12450000) → "৳1,24,500.00"
 *   formatBDT(-5000)    → "−৳50.00"
 */
export function formatBDT(minor) {
  const negative = minor < 0;
  const abs = Math.abs(Math.trunc(minor));
  const rupees = Math.floor(abs / 100);
  const paisa = abs % 100;

  const s = String(rupees);
  let lastThree;
  let rest;
  if (s.length <= 3) {
    lastThree = s;
    rest = "";
  } else {
    lastThree = "," + s.slice(-3);
    rest = s.slice(0, -3);
  }
  const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  const sign = negative ? UNICODE_MINUS : "";
  return `${sign}৳${grouped}.${String(paisa).padStart(2, "0")}`;
}

/** True if a value is a safe, integer minor-unit amount. */
export function isMinor(value) {
  return Number.isInteger(value) && Number.isSafeInteger(value);
}

/** Like formatBDT but drops .00 for whole-BDT amounts. */
export function formatBDTShort(minor) {
  const full = formatBDT(minor);
  return full.endsWith(".00") ? full.slice(0, -3) : full;
}