/* ----------------------------------------------------------------
   Default categories seeded on first launch.
   IDs are prefixed with `inc-` / `exp-` so a name like "Other"
   can exist once per type without collision.
   ---------------------------------------------------------------- */

export const TRANSFER_FEES_CATEGORY_ID = "exp-transfer-fees";
export const TRANSFER_FEES_CATEGORY_NAME = "Transfer fees";

export const DEFAULT_CATEGORIES = [
    /* Income */
    { id: "inc-salary", name: "Salary", type: "income", isDefault: true },
    { id: "inc-freelance", name: "Freelance", type: "income", isDefault: true },
    { id: "inc-business", name: "Business", type: "income", isDefault: true },
    { id: "inc-gift", name: "Gift", type: "income", isDefault: true },
    { id: "inc-side", name: "Side income", type: "income", isDefault: true },
    { id: "inc-other", name: "Other", type: "income", isDefault: true },

    /* Expense */
    { id: "exp-groceries", name: "Groceries", type: "expense", isDefault: true },
    { id: "exp-bills", name: "Bills", type: "expense", isDefault: true },
    { id: "exp-transport", name: "Transport", type: "expense", isDefault: true },
    { id: "exp-rent", name: "Rent", type: "expense", isDefault: true },
    { id: "exp-food", name: "Food & dining", type: "expense", isDefault: true },
    { id: "exp-health", name: "Health", type: "expense", isDefault: true },
    { id: "exp-other", name: "Other", type: "expense", isDefault: true },
    {
        id: TRANSFER_FEES_CATEGORY_ID,
        name: TRANSFER_FEES_CATEGORY_NAME,
        type: "expense",
        isDefault: true,
    },
];