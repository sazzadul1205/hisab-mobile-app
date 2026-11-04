# AGENTS.md — Hisab Mobile App

Coding guidelines for AI agents working in this repository.

## Project Overview

Hisab is a local-first, PIN-encrypted personal finance PWA for Bangladesh (BDT only). All financial data is stored in IndexedDB (Dexie) and encrypted at rest with AES-GCM. There is no server, no account, and no telemetry.

**Golden rule:** Never commit secrets, keys, or unencrypted financial data.

## Tech Stack

- React 19 + Vite + Tailwind CSS v4
- Dexie (IndexedDB) + dexie-react-hooks (`useLiveQuery`)
- Web Crypto API (PBKDF2-SHA256, AES-GCM)
- Vitest + fake-indexeddb for tests
- ESLint (flat config, react-hooks, react-refresh)

## Code Conventions

### Amounts

- **All amounts are integer minor units (paisa).** 1 BDT = 100 paisa.
- Never use floats for arithmetic. Use `toMinor()` / `fromMinor()` from `src/lib/money.js`.
- `parseMoney()` parses user input (handles `৳`, commas, unicode minus) → paisa.
- `formatBDT()` formats paisa → display string with Indian (lakh/crore) grouping.

### Encryption

- Every write goes through `encryptRecord(table, record)` from `src/services/encryption.js`.
- Every read goes through `decryptRecord(table, row)`.
- The DEK lives in memory only (`src/auth/session.js`). Locking zeroes it.
- Never log decrypted data, keys, or PINs.
- Never store the DEK or PIN in IndexedDB, localStorage, or anywhere persistent.

### Component Style

- Functional components only. Hooks at the top, never conditionally.
- Use the CSS variable theme (`--bg`, `--brand`, `--ink`, etc.). Never hardcode colors.
- Mobile-first layout. Use `min-h-dvh`, `env(safe-area-inset-*)`, and `md:` breakpoints for the desktop preview chrome.
- All pages wrap in `<PhoneFrame>` + `<StatusBar>` + `<ScrollArea>` + `<BottomNav>`.
- Use the shared components in `src/components/` — don't re-implement buttons, inputs, or list items.

### Routing

- Routes are defined in `src/App.jsx` with guards from `src/auth/RouteGuards.jsx`.
- `RequireAuth` wraps every financial page. `RequireNoVault` wraps `/welcome`. `RequireVaultLocked` wraps `/unlock`.
- Never add a route that bypasses `RequireAuth` for financial data.

### Testing

- Tests live next to source: `foo.test.js`.
- Use `resetTestState()` from `src/test/helpers.js` in `beforeEach`.
- Use the fast KDF preset `{ iterations: 10_000 }` in tests — never the real 600k.
- Run `npm run test:run` before considering a task done.

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full two-layer key system design and data flow.

## PWA

See [PWA.md](PWA.md) for service worker, manifest, icons, iOS specifics, and deployment config.

## Hard Rules

1. **No network calls for financial data.** The app is offline-first.
2. **No plaintext financial data in storage.** Index fields (`id`, `type`, `date`, `accountId`) are plaintext so Dexie can query; everything else is in `enc: { iv, ct }`.
3. **PIN is never recoverable.** Lost PIN → restore from encrypted backup only.
4. **Backup password is independent of the PIN.**
5. **Never commit** secrets, keys, or unencrypted financial data.
6. **Async crypto outside transactions.** Crypto yields auto-commit Dexie zones early. Encrypt/decrypt outside `db.transaction()`.

## Common Pitfalls

- **Forgetting to encrypt a write.** Always use `encryptRecord`. Raw `db.X.add(plaintext)` is a bug.
- **Calling decrypt inside a Dexie transaction.** Same auto-commit risk as crypto.
- **Using `Date.now()` for business logic.** Use ISO strings for `date` fields (the schema sorts on them).
- **Storing floats.** `amount: 12.50` is wrong. It must be `1250` (paisa).
- **Forgetting `enc` on index fields.** `encryptRecord` duplicates index fields into the plaintext row AND the encrypted blob. If you add a new index field, update `INDEX_FIELDS` in `encryption.js`.

## Commands

```bash
npm install        # Install deps
npm run dev        # Dev server (host + PWA)
npm run build      # Production build
npm run lint       # ESLint
npm run lint:fix   # Auto-fix
npm run test:run   # Run all tests
npm run preview    # Preview production build
```
