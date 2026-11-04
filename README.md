# Hisab — Personal Finance & Bookkeeping PWA

A private, local-first, mobile-friendly app for recording daily income and expenses across multiple accounts (cash, bKash, bank), tracking balances, and understanding spending through charts.

**No accounts. No cloud. No tracking.** Your data stays on your device, encrypted by your PIN.

## Features

- **Security:** 6-digit PIN, PBKDF2 + AES-GCM encryption at rest, auto-lock, encrypted backups.
- **Accounts:** Track balances across Cash, bKash, Nagad, and Bank accounts.
- **Transactions:** Income, Expenses, and Transfers (with fee handling).
- **Insights:** Real-time dashboard, spending breakdowns, and period reports.
- **Import:** Local CSV parsing for bKash and bank statements.
- **Export:** Spreadsheet-friendly CSV export.
- **PWA:** Installable on iOS/Android, works fully offline.

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS v4
- **State/Routing:** React Router, Dexie (IndexedDB), `useLiveQuery`
- **Crypto:** Web Crypto API (PBKDF2-SHA256, AES-GCM)
- **Testing:** Vitest + fake-indexeddb (162 passing tests)

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
