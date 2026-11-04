# Changelog

All notable changes to Hisab are documented here.

---

## [1.0.0] — 2026-11-04

### Added
- Initial public release.
- Local-first personal finance PWA for Bangladesh (BDT only).
- Two-layer encryption: PBKDF2-SHA256 master key + AES-GCM DEK.
- Account management (Cash, Mobile wallet, Bank, Other).
- Income, expense, and transfer transactions with fee handling.
- Dashboard with combined balance, weekly chart, category breakdown.
- CSV import for bKash and bank statements with duplicate detection.
- Encrypted backup (.hisab) and plaintext CSV export.
- Reconciliation records per account.
- Auto-lock with configurable inactivity timeout.
- PIN setup flow with weak-PIN warning.
- Delete-all with PIN re-authentication and typed confirmation.
- PWA manifest, service worker, and iOS home screen support.
- 162 passing tests across 13 test files.

### Security
- All financial data encrypted at rest with AES-GCM.
- DEK stored in memory only; zeroed on lock.
- No PIN recovery backdoor — lost PIN requires encrypted backup.
- Backup password independent of PIN.
- Failed-attempt throttle with escalating delays.
- Content Security Policy header in production builds.
- Production `console.error` stripped via `import.meta.env.DEV`.

---

## [0.1.0] — 2026-10-20

### Added
- Project scaffolding with Vite, React 19, Tailwind CSS v4.
- Dexie schema and seed default categories.
- Vault setup, unlock, and change PIN flows.
- Route guards (RequireAuth, RequireNoVault, RequireVaultLocked).
- Basic dashboard with balance card and quick actions.

---

## [0.0.1] — 2026-10-05

### Added
- Initial commit.
- README, architecture docs, and SRS acceptance criteria.