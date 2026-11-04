export const APP_NAME = "Personal Finance & Bookkeeping";
export const CURRENCY = "BDT";
export const CURRENCY_MINOR_DIGITS = 2;
export const PIN_LENGTH = 6;

export const ACCOUNT_TYPES = [
    { value: "cash", label: "Cash" },
    { value: "wallet", label: "Mobile wallet" },
    { value: "bank", label: "Bank account" },
    { value: "other", label: "Other" },
];

export const ACCOUNT_TYPE_LABEL = Object.fromEntries(
    ACCOUNT_TYPES.map((t) => [t.value, t.label]),
);

/* ----------------------------------------------------------------
   Weak PIN patterns. Warn (do not block) when the chosen PIN
   matches one of these. Blocking would frustrate users who
   genuinely chose a simple PIN; warning is enough friction.
   ---------------------------------------------------------------- */

const WEAK_SEQUENTIAL_UP = ["123456", "234567", "345678", "456789"];
const WEAK_SEQUENTIAL_DOWN = ["654321", "543210", "765432", "876543", "987654"];
const WEAK_REPEATED = [
    "000000", "111111", "222222", "333333", "444444",
    "555555", "666666", "777777", "888888", "999999",
];
const WEAK_COMMON = [
    "123456", "121212", "112233", "123123", "101010",
    "111000", "000111", "100000", "200000", "010101",
];

export const WEAK_PINS = new Set([
    ...WEAK_SEQUENTIAL_UP,
    ...WEAK_SEQUENTIAL_DOWN,
    ...WEAK_REPEATED,
    ...WEAK_COMMON,
]);

export function isWeakPin(pin) {
    return WEAK_PINS.has(pin);
}