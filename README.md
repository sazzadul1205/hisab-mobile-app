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

- **Frontend:** React 19, Vite, Tailwind CSS v4
- **State/Routing:** React Router, Dexie (IndexedDB), `useLiveQuery`
- **Crypto:** Web Crypto API (PBKDF2-SHA256, AES-GCM)
- **Testing:** Vitest + fake-indexeddb (162 passing tests)

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the dev server:
   ```bash
   npm run dev
   ```
3. Run tests:
   ```bash
   npm run test:run
   ```
4. Lint:
   ```bash
   npm run lint
   ```
5. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

```text
src/
├── App.jsx              # Route definitions + guards
├── main.jsx             # Entry point
├── auth/                # Auth provider, route guards, session, throttle, theme
├── components/          # Reusable UI primitives (PhoneFrame, Button, etc.)
├── constants/           # App constants, categories, icons
├── crypto/              # vault.js, kdf.js, aes.js
├── db/                  # Dexie schema + seed
├── hooks/               # useAccounts, useTransactions, useLookup
├── lib/                 # money.js, webcrypto.js, base64.js
├── pages/               # All route-level pages
├── services/            # Domain services (transactions, backup, etc.)
└── test/                # Test setup + helpers
```

## Security Model

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full two-layer key system design.

## Documentation

- [Architecture & Security Design](ARCHITECTURE.md)
- [PWA Guide](PWA.md)
- [SRS Acceptance Criteria](SRS-ACCEPTANCE.md)
- [UI Design Reference](Design.html)
- [Agent Guidelines](AGENTS.md)
- [Contributing](CONTRIBUTING.md)

## License

Proprietary — for internal use only.
