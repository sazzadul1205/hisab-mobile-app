/* ----------------------------------------------------------------
   Demo transaction records.
   Keys match the ids used across Dashboard / Transactions /
   AccountDetail so any tap lands on the correct detail view.
   When the DB wires in, this file becomes:
     export async function getTransaction(id) { return db.transactions.get(id); }
   ---------------------------------------------------------------- */
export const DEMO_TRANSACTIONS = {
  /* Dashboard recent */
  1: {
    type: "expense",
    amount: "৳850.00",
    date: "29 Oct 2026 · 9:12 AM",
    from: "Cash",
    category: "Household",
    note: "Weekly groceries — Karwan Bazar",
    createdAt: "29 Oct · 9:12 AM",
    updatedAt: "29 Oct · 9:12 AM",
  },
  2: {
    type: "income",
    amount: "৳45,000.00",
    date: "29 Oct 2026 · 8:00 AM",
    to: "City Bank — Savings",
    category: "Salary",
    note: "October salary credit",
    createdAt: "29 Oct · 8:00 AM",
    updatedAt: "29 Oct · 8:00 AM",
  },
  3: {
    type: "transfer",
    amount: "৳5,000.00",
    date: "28 Oct 2026 · 6:20 PM",
    from: "City Bank — Savings",
    to: "bKash",
    fee: "৳25.00",
    totalDebit: "৳5,025.00",
    note: "Moving to bKash for online payments",
    createdAt: "28 Oct · 6:20 PM",
    updatedAt: "28 Oct · 6:20 PM",
  },

  /* Transactions list */
  t1: {
    type: "income",
    amount: "৳45,000.00",
    date: "29 Oct 2026 · 8:00 AM",
    to: "City Bank — Savings",
    category: "Salary",
    note: "October salary credit",
    createdAt: "29 Oct · 8:00 AM",
    updatedAt: "29 Oct · 8:00 AM",
  },
  t2: {
    type: "expense",
    amount: "৳850.00",
    date: "29 Oct 2026 · 9:12 AM",
    from: "Cash",
    category: "Household",
    note: "Weekly groceries — Karwan Bazar",
    createdAt: "29 Oct · 9:12 AM",
    updatedAt: "29 Oct · 9:12 AM",
  },
  t3: {
    type: "expense",
    amount: "৳120.00",
    date: "29 Oct 2026 · 10:05 AM",
    from: "Cash",
    category: "Transport",
    note: "Rickshaw fare — Office to home",
    createdAt: "29 Oct · 10:05 AM",
    updatedAt: "29 Oct · 10:05 AM",
  },
  t4: {
    type: "transfer",
    amount: "৳5,000.00",
    date: "28 Oct 2026 · 6:20 PM",
    from: "City Bank — Savings",
    to: "bKash",
    fee: "৳25.00",
    totalDebit: "৳5,025.00",
    note: "Moving to bKash for online payments",
    createdAt: "28 Oct · 6:20 PM",
    updatedAt: "28 Oct · 6:20 PM",
  },
  t5: {
    type: "expense",
    amount: "৳1,850.00",
    date: "28 Oct 2026 · 11:02 AM",
    from: "bKash",
    category: "Utilities",
    note: "Electricity bill — DESCO",
    createdAt: "28 Oct · 11:02 AM",
    updatedAt: "28 Oct · 11:02 AM",
  },
  t6: {
    type: "income",
    amount: "৳8,000.00",
    date: "28 Oct 2026 · 4:12 PM",
    to: "bKash",
    category: "Side income",
    note: "Freelance payment — client invoice",
    createdAt: "28 Oct · 4:12 PM",
    updatedAt: "28 Oct · 4:12 PM",
  },
  t7: {
    type: "expense",
    amount: "৳550.00",
    date: "27 Oct 2026 · 8:40 PM",
    from: "bKash",
    category: "Utilities",
    note: "Mobile recharge",
    createdAt: "27 Oct · 8:40 PM",
    updatedAt: "27 Oct · 8:40 PM",
  },

  /* Account detail */
  a1: {
    type: "income",
    amount: "৳45,000.00",
    date: "29 Oct 2026 · 8:00 AM",
    to: "City Bank — Savings",
    category: "Salary",
    note: "October salary credit",
    createdAt: "29 Oct · 8:00 AM",
    updatedAt: "29 Oct · 8:00 AM",
  },
  a2: {
    type: "transfer",
    amount: "৳5,000.00",
    date: "29 Oct 2026 · 9:30 AM",
    from: "City Bank — Savings",
    to: "bKash",
    fee: "৳25.00",
    totalDebit: "৳5,025.00",
    note: "Moving to bKash for online payments",
    createdAt: "29 Oct · 9:30 AM",
    updatedAt: "29 Oct · 9:30 AM",
  },
  a3: {
    type: "expense",
    amount: "৳1,200.00",
    date: "28 Oct 2026 · 3:40 PM",
    from: "City Bank — Savings",
    category: "Utilities",
    note: "Internet bill — Link3",
    createdAt: "28 Oct · 3:40 PM",
    updatedAt: "28 Oct · 3:40 PM",
  },

  /* Canonical (matches the design mock exactly) */
  demo: {
    type: "transfer",
    amount: "৳5,000.00",
    date: "29 Oct 2026 · 9:30 AM",
    from: "City Bank — Savings",
    to: "bKash",
    fee: "৳25.00",
    totalDebit: "৳5,025.00",
    note: "Moving to bKash for online payments",
    createdAt: "29 Oct · 9:30 AM",
    updatedAt: "29 Oct · 9:30 AM",
  },
};

// Fallback for unknown ids — matches the mock's transfer demo
export const FALLBACK = DEMO_TRANSACTIONS.demo;

export function getDemoTransaction(id) {
  return DEMO_TRANSACTIONS[String(id)] ?? FALLBACK;
}
