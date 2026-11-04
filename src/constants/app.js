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